import React, { useState } from "react";
import { SheetData, UIState } from "../../../types";

import '../../../../css/taskpanes/AITransformation/AITransformation.css';
import MitoAPI from "../../../jupyter/api";
import { classNames } from "../../../utils/classNames";
import { getDisplayColumnHeader } from "../../../utils/columnHeaders";
import Col from "../../layout/Col";
import Row from "../../layout/Row";
import { AITransformationParams, AITransformationResult } from "./AITransformationTaskpane";

interface AITransformationResultSectionProps {
    mitoAPI: MitoAPI;
    setUIState: React.Dispatch<React.SetStateAction<UIState>>;
    result: AITransformationResult | undefined;
    sheetDataArray: SheetData[]
    params: AITransformationParams
}

const AITransformationResultSection = (props: AITransformationResultSectionProps): JSX.Element => {

    const [sentFeedback, setSentFeedback] = useState<'Up' | 'Down' | undefined>(undefined);
    
    const result = props.result;

    if (result === undefined) {
        return <></>
    }

    const logParams: Record<string, unknown> = {
        prompt_version: props.params.prompt_version,
        // Do a little work to avoid length limits
        prompt: props.params.prompt.split('\n'),
        completion: props.params.completion.split('\n'),
        edited_completion: props.params.edited_completion.split('\n')
    }

    return (
        <>
            {result.last_line_value !== undefined && result.last_line_value !== null && 
                <p><span className="text-bold">Value:</span> {result.last_line_value}</p>
            }
            {result.prints.length > 0 && 
                <>
                    <p><span className="text-bold">Printed:</span></p>
                    <pre>{result.prints}</pre>
                </>
            }
            {result.created_dataframe_names.map(dfName => {
                const sheetIndex = props.sheetDataArray.findIndex(sd => sd.dfName === dfName);
                const sheetData = props.sheetDataArray[sheetIndex];
                const numRows = sheetData?.numRows || 0;
                const numColumns = sheetData?.numColumns || 0;
                return (
                    <div 
                        key={dfName}
                        onClick={() => {
                            props.setUIState(prevUIState => {
                                return {
                                    ...prevUIState,
                                    selectedSheetIndex: sheetIndex !== -1 ? sheetIndex : prevUIState.selectedSheetIndex
                                }
                            })
                        }}>
                        <span className="text-bold">Created:</span> <span className="text-underline">{dfName}</span>  ({numRows} rows, {numColumns} columns)
                    </div>
                )
            })}
            {Object.entries(result.modified_dataframes_recons).map(([dfName, modifiedDataframeRecon]) => {
                const columnReconData = modifiedDataframeRecon.column_recon;
                const sheetIndex = props.sheetDataArray.findIndex(sd => sd.dfName === dfName);
                const rowChange = modifiedDataframeRecon.num_added_or_removed_rows;
                const rowChangeTest = rowChange !== 0 ? (rowChange < 0 ? `(Removed ${rowChange * -1} rows)` : `(Added ${rowChange} rows)`) : undefined;
                return (
                    <div key={dfName}>
                        <div 
                            onClick={() => {
                                props.setUIState(prevUIState => {
                                    return {
                                        ...prevUIState,
                                        selectedSheetIndex: sheetIndex !== -1 ? sheetIndex : prevUIState.selectedSheetIndex
                                    }
                                })
                            }}>
                            <span className="text-bold">Modified:</span> <span className="text-underline">{dfName}</span> {rowChangeTest}
                        </div>
                        {columnReconData.created_columns.map((ch, index) => {
                            return <div key={dfName + 'added' + index} className="ml-5px">Added column: {getDisplayColumnHeader(ch)}</div>
                        })}
                        {columnReconData.modified_columns.map((ch, index) => {
                            return <div key={dfName + 'modified' + index} className="ml-5px">Modified column: {getDisplayColumnHeader(ch)}</div>
                        })}
                        {Object.entries(columnReconData.renamed_columns).map(([oldCh, newCh], index) => {
                            return <div key={dfName + 'renamed' + index} className="ml-5px">Renamed column: {getDisplayColumnHeader(oldCh)} to {getDisplayColumnHeader(newCh)} </div>
                        })}
                        {columnReconData.deleted_columns.map((ch, index) => {
                            return <div key={dfName + 'removed' + index} className="ml-5px">Deleted column: {getDisplayColumnHeader(ch)}</div>
                        })}
                    </div>
                )
            })}
            {result.deleted_dataframe_names.map(dfName => {
                return (
                    <div key={dfName}>
                        <span className="text-bold">Deleted:</span> <span>{dfName}</span> 
                    </div>
                )
            })}
            {(result.last_line_value === undefined || result.last_line_value === null) 
                && result.created_dataframe_names.length === 0 
                && Object.entries(result.modified_dataframes_recons).length === 0 
                && result.prints.length === 0
                && result.deleted_dataframe_names.length === 0 && 
                <p className="text-bold">
                    No changes
                </p>
            }
            <Row justify="space-between" align="center">
                <Col>
                    <p className="text-bold">
                        How did Mito AI Assistant do?
                    </p>
                </Col>
                <Col offsetRight={.5}>
                    <Row suppressTopBottomMargin>
                        <Col>
                            <p
                                className={classNames("ai-transformation-feedback-button", {'ai-transformation-feedback-button-selected': sentFeedback === 'Up'})}
                                onClick={() => {
                                    setSentFeedback('Up');
                                    
                                    void props.mitoAPI.log('ai_transformation_feedback', {
                                        'feedback': 'Up',
                                        ...logParams
                                    })
                                }}
                            >
                                👍
                            </p>
                        </Col>
                        <Col offset={2}>
                            <p
                                className={classNames("ai-transformation-feedback-button", {'ai-transformation-feedback-button-selected': sentFeedback === 'Down'})}
                                onClick={() => {
                                    setSentFeedback('Down')
                                    void props.mitoAPI.log('ai_transformation_feedback', {
                                        'feedback': 'Down',
                                        ...logParams
                                    })
                                }}
                            >
                                👎
                            </p>
                        </Col>
                    </Row>
                </Col>

            </Row>
            {sentFeedback !== undefined && 
                <p>Thanks for the feedback - {sentFeedback === 'Down' ? "we're working hard to improve." : "we're glad things are working well!"}</p>
            }
        </>

    )
}

export default AITransformationResultSection;