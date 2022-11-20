// Copyright (c) Mito

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
/*
    Import CSS that we use globally, list these in alphabetical order
    to make it easier to confirm we have imported all sitewide css.

    Except we put the colors.css first because it creates variables used elsewhere.
*/
import '../../css/sitewide/all-modals.css';
import '../../css/sitewide/animations.css';
import '../../css/sitewide/borders.css';
import '../../css/sitewide/colors.css';
import '../../css/sitewide/cursor.css';
import '../../css/sitewide/element-sizes.css';
import '../../css/sitewide/flexbox.css';
import '../../css/sitewide/fonts.css';
import '../../css/sitewide/height.css';
import '../../css/sitewide/icons.css';
import '../../css/sitewide/margins.css';
import '../../css/sitewide/paddings.css';
import '../../css/sitewide/scroll.css';
import '../../css/sitewide/text.css';
import '../../css/sitewide/widths.css';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMitoAPI } from '../jupyter/api';
import { getArgs, writeAnalysisToReplayToMitosheetCall, writeGeneratedCodeToCell } from '../jupyter/jupyterUtils';
import ConditionalFormattingTaskpane from '../pro/taskpanes/ConditionalFormatting/ConditionalFormattingTaskpane';
import SetDataframeFormatTaskpane from '../pro/taskpanes/SetDataframeFormat/SetDataframeFormatTaskpane';
import { AnalysisData, DataTypeInMito, DFSource, EditorState, GridState, PopupLocation, PopupType, SheetData, UIState, UserProfile } from '../types';
import { createActions } from '../utils/actions';
import { classNames } from '../utils/classNames';
import { isMitoError } from '../utils/errors';
import loadPlotly from '../utils/plotly';
import CatchUpPopup from './CatchUpPopup';
import ErrorBoundary from './elements/ErrorBoundary';
import EndoGrid from './endo/EndoGrid';
import { focusGrid } from './endo/focusUtils';
import { getCellDataFromCellIndexes, getDefaultGridState } from './endo/utils';
import Footer from './footer/Footer';
import { selectPreviousGraphSheetTab } from './footer/SheetTab';
import ClearAnalysisModal from './modals/ClearAnalysisModal';
import DeleteGraphsModal from './modals/DeleteGraphsModal';
import ErrorModal from './modals/ErrorModal';
import { ModalEnum } from './modals/modals';
import ErrorReplayedAnalysisModal from './modals/ReplayAnalysisModals';
import SignUpModal from './modals/SignupModal';
import UpgradeModal from './modals/UpgradeModal';
import ConcatTaskpane from './taskpanes/Concat/ConcatTaskpane';
import ControlPanelTaskpane, { ControlPanelTab } from './taskpanes/ControlPanel/ControlPanelTaskpane';
import DataframeImportTaskpane from './taskpanes/DataframeImport/DataframeImportTaskpane';
import DefaultEmptyTaskpane from './taskpanes/DefaultTaskpane/DefaultEmptyTaskpane';
import DownloadTaskpane from './taskpanes/Download/DownloadTaskpane';
import DropDuplicatesTaskpane from './taskpanes/DropDuplicates/DropDuplicates';
import ImportTaskpane from './taskpanes/FileImport/FileImportTaskpane';
import FillNaTaskpane from './taskpanes/FillNa/FillNaTaskpane';
import GraphSidebar from './taskpanes/Graph/GraphSidebar';
import MeltTaskpane from './taskpanes/Melt/MeltTaskpane';
import MergeTaskpane from './taskpanes/Merge/MergeTaskpane';
import PivotTaskpane from './taskpanes/PivotTable/PivotTaskpane';
import SplitTextToColumnsTaskpane from './taskpanes/SplitTextToColumns/SplitTextToColumnsTaskpane';
import UpdateImportsTaskpane from './taskpanes/UpdateImports/UpdateImportsTaskpane';
// AUTOGENERATED LINE: MITOIMPORT (DO NOT DELETE)
import BottomLeftPopup from './elements/BottomLeftPopup';
import EphemeralMessage from './popups/EphemeralMessage';
import StepsTaskpane from './taskpanes/Steps/StepsTaskpane';
import { EDITING_TASKPANES, TaskpaneType } from './taskpanes/taskpanes';
import UpgradeToProTaskpane from './taskpanes/UpgradeToPro/UpgradeToProTaskpane';
import Toolbar from './toolbar/Toolbar';
import Tour from './tour/Tour';
import { TourName } from './tour/Tours';

export type MitoProps = {
    comm_target_id: string,
    sheetDataArray: SheetData[],
    analysisData: AnalysisData,
    userProfile: UserProfile,
};

export const Mito = (props: MitoProps): JSX.Element => {

    const mitoContainerRef = useRef<HTMLDivElement>(null);

    const [sheetDataArray, setSheetDataArray] = useState<SheetData[]>(props.sheetDataArray);
    const [analysisData, setAnalysisData] = useState<AnalysisData>(props.analysisData);
    const [userProfile, setUserProfile] = useState<UserProfile>(props.userProfile);

    const [gridState, setGridState] = useState<GridState>(() => getDefaultGridState(sheetDataArray, 0))
    // Set reasonable default values for the UI state
    const [uiState, setUIState] = useState<UIState>({
        loading: [],
        currOpenModal: userProfile.userEmail == '' && userProfile.telemetryEnabled // no signup if no logs
            ? {type: ModalEnum.SignUp} 
            : (userProfile.shouldUpgradeMitosheet 
                ? {type: ModalEnum.Upgrade} : {type: ModalEnum.None}
            ),
        currOpenTaskpane: {type: TaskpaneType.NONE},
        selectedColumnControlPanelTab: ControlPanelTab.FilterSort,
        selectedSheetIndex: 0,
        selectedGraphID: Object.keys(analysisData.graphDataDict || {}).length === 0 ? undefined : Object.keys(analysisData.graphDataDict)[0],
        selectedTabType: 'data',
        currOpenToolbarDropdown: undefined,
        toolbarDropdown: undefined,
        exportConfiguration: {exportType: 'csv'},
        currOpenPopups: {
            [PopupLocation.TopRight]: {type: PopupType.None}
        }
    })
    const [editorState, setEditorState] = useState<EditorState | undefined>(undefined);

    const [highlightPivotTableButton, setHighlightPivotTableButton] = useState(false);
    const [highlightAddColButton, setHighlightAddColButton] = useState(false);

    // We store the path that the user last uses when they are using the import
    // in Mito so that we can open to the same place next time they use it
    const [currPathParts, setCurrPathParts] = useState<string[]>(['.']);

    // Create the Mito API
    const mitoAPI = useMitoAPI(props.comm_target_id, setSheetDataArray, setAnalysisData, setUserProfile, setUIState)

    useEffect(() => {
        // We log that the mitosheet has rendered explicitly, so that we can
        // tell if an installation is broken
        void mitoAPI.log('mitosheet_rendered');
    }, [])

    useEffect(() => {
        /**
         * The mitosheet is rendered first when the mitosheet.sheet() call is made,
         * but then it may be rerendered when the page the mitosheet is on is refreshed.
         * 
         * However, there are a few things we only want to do on this first render, and
         * not when the page is refreshed. We do those things in this effect, and additionally
         * track each time we rerender.
         */
        const updateMitosheetCallCellOnFirstRender = async () => {
            // The first thing we need to do is go and read the arguments to the mitosheet.sheet() call. If there
            // is an analysis to replay, we use this to help lookup the call
            const args = await getArgs(analysisData.analysisToReplay?.analysisName);
            await mitoAPI.updateArgs(args);

            // Then, after we have the args, we replay an analysis if there is an analysis to replay
            // Note that this has to happen after so that we have the the argument names loaded in at
            // the very start of the analysis
            if (analysisData.analysisToReplay) {
                const analysisToReplayName = analysisData.analysisToReplay?.analysisName;

                // First, if the analysis to replay does not exist at all, we just open an error modal
                // and tell users that this does not exist on their computer
                if (!analysisData.analysisToReplay.existsOnDisk) {
                    void mitoAPI.log('replayed_nonexistant_analysis_failed')

                    setUIState(prevUIState => {
                        return {
                            ...prevUIState,
                            currOpenModal: {
                                type: ModalEnum.ErrorReplayedAnalysis,
                                header: 'analysis_to_replay does not exist',
                                message: `We're unable to replay ${analysisToReplayName} because you don't have access to it. This is probably because the analysis was created on a different computer.`,
                                error: undefined,
                                oldAnalysisName: analysisToReplayName,
                                newAnalysisName: analysisData.analysisName
                            }
                        }
                    })
                    return;
                }

                // Then, we replay the analysis to replay!
                const error = await mitoAPI.updateReplayAnalysis(analysisToReplayName);
                
                if (isMitoError(error)) {
                    /**
                     * If an analysis fails to replay, we open the update import pre replay 
                     * taskpane with the error. The analysis either failed because an import
                     * step failed, or some other step failed as the structure of the data 
                     * changed. 
                     * 
                     * In either case, we give the user the update import pre replay taskpane
                     * so that they can hopefully resolve these issues.
                     */
                    setUIState(prevUIState => {
                        return {
                            ...prevUIState,
                            currOpenTaskpane: {
                                type: TaskpaneType.UPDATEIMPORTS,
                                failedReplayData: {
                                    analysisName: analysisToReplayName,
                                    error: error
                                }
                            }
                        }
                    })
                }
            } else {
                /**
                 * If there is no analysis_to_replay, then we need to write the analysis_to_replay to the 
                 * mitosheet.sheet call. 
                 */
                writeAnalysisToReplayToMitosheetCall(analysisData.analysisName, mitoAPI);
            }
        }

        const handleRender = async () => {
            if (analysisData.renderCount === 0) {
                await updateMitosheetCallCellOnFirstRender();
            }
            // Anytime we render, update the render count
            await mitoAPI.updateRenderCount();
        }

        void handleRender();
    }, [])

    useEffect(() => {
        /**
         * We only write code after the render count has been incremented once, which
         * means that we have read in and replayed the updated analysis, etc. 
         */
        if (analysisData.renderCount >= 1) {
            // Finially, we can go and write the code!
            writeGeneratedCodeToCell(analysisData.analysisName, analysisData.code, userProfile.telemetryEnabled);
        }
        // TODO: we should store some data with analysis data to not make
        // this run too often?
    }, [analysisData])

    // Load plotly, so we can generate graphs
    useEffect(() => {
        loadPlotly()
    }, [])

    /* 
        When the number of sheets increases, we make sure
        that the last sheet is highlighted. If it decreases,
        we make sure it is not out of bounds.

        We use a ref to store the previous number to avoid
        triggering unnecessary rerenders.
    */
    const previousNumSheetsRef = useRef<number>(sheetDataArray.length);
    useEffect(() => {
        const previousNumSheets = previousNumSheetsRef.current;

        // Make sure that the selectedSheetIndex is always >= 0 so we can index into the 
        // widthDataArray without erroring
        setUIState(prevUIState => {

            const prevSelectedSheetIndex = prevUIState.selectedSheetIndex;
            let newSheetIndex = prevSelectedSheetIndex;

            if (previousNumSheets < sheetDataArray.length) {
                newSheetIndex = sheetDataArray.length - 1 >= 0 ? sheetDataArray.length - 1 : 0;
            } else if (prevSelectedSheetIndex >= sheetDataArray.length) {
                newSheetIndex = sheetDataArray.length - 1 >= 0 ? sheetDataArray.length - 1 : 0;
            }
            
            return {
                ...prevUIState,
                selectedSheetIndex: newSheetIndex,
            };
        })

        previousNumSheetsRef.current = sheetDataArray.length;
    }, [sheetDataArray])

    const previousNumGraphsRef = useRef<number>(Object.keys(analysisData.graphDataDict || {}).length)
    const previousGraphIndex = useRef<number>(uiState.selectedGraphID !== undefined ?
        Object.keys(analysisData.graphDataDict  || {}).indexOf(uiState.selectedGraphID) : -1)

    // When we switch graphID's make sure that we keep the previousGraphIndex up to date
    useEffect(() => {
        previousGraphIndex.current = uiState.selectedGraphID !== undefined ?
            Object.keys(analysisData.graphDataDict || {}).indexOf(uiState.selectedGraphID) : -1
    }, [uiState.selectedGraphID])

    // Update the selected sheet tab when the number of graphs change. 
    useEffect(() => {
        const graphIDs = Object.keys(analysisData.graphDataDict || {})
        const previousNumGraphs = previousNumGraphsRef.current;
        const newNumGraphs = Object.keys(analysisData.graphDataDict || {}).length

        // Handle new graph created
        if (previousNumGraphs < newNumGraphs) {
            const newGraphID = graphIDs[newNumGraphs - 1]
            setUIState(prevUIState => {
                return {
                    ...prevUIState,
                    selectedGraphID: newGraphID,
                    selectedTabType: 'graph',
                    currOpenTaskpane: {
                        type: TaskpaneType.GRAPH,
                        graphID: newGraphID,
                    },
                }
            })

            // Update the previous graph index for next time
            previousGraphIndex.current = graphIDs.indexOf(newGraphID)

        // Handle graph removal
        } else if (previousNumGraphs > newNumGraphs) {
            // Try to go to the same sheet index, if it doesn't exist go to the graph index - 1, 
            // if no graphs exists, go to the last sheet index
            const newGraphID = selectPreviousGraphSheetTab(analysisData.graphDataDict, previousGraphIndex.current, setUIState)

            // Update the previous graph index for next time
            previousGraphIndex.current = newGraphID !== undefined ? graphIDs.indexOf(newGraphID) : -1
        }

        previousNumGraphsRef.current = newNumGraphs
    }, [Object.keys(analysisData.graphDataDict || {}).length])


    /*
        Code to be executed everytime the sheet is switched. 
        1. if the sheet that is switched to is a pivot sheet, we start editing this pivot table
        2. if the cell editor is open, close it.
    */
    useEffect(() => {
        const openEditedPivot = async (): Promise<void> => {
            const existingPivotParams = await mitoAPI.getPivotParams(uiState.selectedSheetIndex);
            if (existingPivotParams !== undefined) {
                setUIState(prevUIState => {
                    return {
                        ...prevUIState,
                        currOpenModal: {type: ModalEnum.None},
                        currOpenTaskpane: {
                            type: TaskpaneType.PIVOT,
                            sourceSheetIndex: existingPivotParams.sheet_index,
                            destinationSheetIndex: uiState.selectedSheetIndex,
                            existingPivotParams: existingPivotParams
                        },
                        selectedTabType: 'data'
                    }
                })
            }
        }

        const source = dfSources[uiState.selectedSheetIndex];
        // Open the pivot if it's a pivot, and there's no other taskpane open
        if (source !== undefined && source === DFSource.Pivoted && uiState.currOpenTaskpane.type === TaskpaneType.NONE) {
            void openEditedPivot()
        }

        // Close the cell editor if it is open
        if (editorState !== undefined) {
            setEditorState(undefined)
        }

    }, [uiState.selectedSheetIndex])

    // Store the prev open taskpane in a ref, to avoid triggering rerenders
    const prevOpenTaskpaneRef = useRef(uiState.currOpenTaskpane.type);
    useEffect(() => {
        // If a taskpane is closed, but was previously open, then we 
        // focus on the grid, ready to accept user input
        if (prevOpenTaskpaneRef.current !== TaskpaneType.NONE && uiState.currOpenTaskpane.type === TaskpaneType.NONE) {
            const endoGridContainer = mitoContainerRef.current?.querySelector('.endo-grid-container') as HTMLDivElement | null | undefined;
            focusGrid(endoGridContainer);
        }

        prevOpenTaskpaneRef.current = uiState.currOpenTaskpane.type;

    }, [uiState]);


    const dfNames = sheetDataArray.map(sheetData => sheetData.dfName);
    const dfSources = sheetDataArray.map(sheetData => sheetData.dfSource);
    const columnIDsMapArray = sheetDataArray.map(sheetData => sheetData.columnIDsMap);

    const lastStepSummary = analysisData.stepSummaryList[analysisData.stepSummaryList.length - 1];

    // Get the column id of the currently selected column. We always default to the 
    // top left corner of the last selection
    const {columnID} = getCellDataFromCellIndexes(
        sheetDataArray[uiState.selectedSheetIndex], 
        gridState.selections[gridState.selections.length - 1].startingRowIndex, 
        gridState.selections[gridState.selections.length - 1].startingColumnIndex
    );

    /* 
        Closes any open editing popups, which includes:
        1. Any open sheet tab actions
        2. The taskpane, if it is an EDITING_TASKPANE
        3. All Modals

        Allows you to optionally specify a list of taskpanes to keep open if they
        are currently open, which is useful for undo, for example,
        when editing a pivot table and pressing undo
    */ 
    const closeOpenEditingPopups = useCallback((taskpanesToKeepIfOpen?: TaskpaneType[]) => {
        // Close the taskpane if it is an editing taskpane, and it is not in the list of taskpanesToKeepIfOpen
        if (EDITING_TASKPANES.includes(uiState.currOpenTaskpane.type) && (taskpanesToKeepIfOpen === undefined || !taskpanesToKeepIfOpen.includes(uiState.currOpenTaskpane.type))) {
            setUIState((prevUIState) => {
                return {
                    ...prevUIState,
                    currOpenTaskpane: {
                        type: TaskpaneType.NONE
                    },
                    currOpenModal: {
                        type: ModalEnum.None
                    },
                    selectedTabType: 'data'
                }
            });
        }
    }, [uiState]);

    const getCurrentModalComponent = (): JSX.Element => {
        // Returns the JSX.element that is currently, open, and is used
        // in render to display this modal

        switch(uiState.currOpenModal.type) {
            case ModalEnum.None: return <div></div>;
            case ModalEnum.Error: return (
                <ErrorModal
                    error={uiState.currOpenModal.error}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    userProfile={userProfile}
                />
            )
            case ModalEnum.ClearAnalysis: return (
                <ClearAnalysisModal
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                />
            )
            case ModalEnum.SignUp: return (
                <SignUpModal
                    setUIState={setUIState}
                    numUsages={userProfile.numUsages}
                    mitoAPI={mitoAPI}
                    isPro={userProfile.isPro}
                    sheetDataArray={sheetDataArray}
                    analysisData={analysisData}
                />
            )
            case ModalEnum.Upgrade: return (
                <UpgradeModal
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                />
            )
            case ModalEnum.ErrorReplayedAnalysis: return (
                <ErrorReplayedAnalysisModal
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    header={uiState.currOpenModal.header}
                    message={uiState.currOpenModal.message}
                    error={uiState.currOpenModal.error}
                    newAnalysisName={uiState.currOpenModal.newAnalysisName}
                    oldAnalysisName={uiState.currOpenModal.oldAnalysisName}
                    userProfile={userProfile}
                />
            )
            case ModalEnum.DeleteGraphs: return (
                <DeleteGraphsModal
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    sheetIndex={uiState.currOpenModal.sheetIndex}
                    dependantGraphTabNamesAndIDs={uiState.currOpenModal.dependantGraphTabNamesAndIDs}
                    dfName={sheetDataArray[uiState.currOpenModal.sheetIndex] ? sheetDataArray[uiState.currOpenModal.sheetIndex].dfName : 'this dataframe'}
                />
            )
        }
    }

    const getCurrOpenTaskpane = (): JSX.Element => {
        switch(uiState.currOpenTaskpane.type) {
            case TaskpaneType.CONTROL_PANEL: 
                return (
                    <ControlPanelTaskpane 
                        // Set the columnHeader, sheet index as the key so that the taskpane updates when it is switched
                        // TODO: figure out why we need this, if the other variables update?
                        key={'' + columnID + uiState.selectedSheetIndex + uiState.selectedColumnControlPanelTab} 
                        selectedSheetIndex={uiState.selectedSheetIndex}
                        sheetData={sheetDataArray[uiState.selectedSheetIndex]}
                        columnIDsMapArray={columnIDsMapArray}
                        selection={gridState.selections[gridState.selections.length - 1]} 
                        gridState={gridState}
                        mitoContainerRef={mitoContainerRef}
                        setUIState={setUIState} 
                        setEditorState={setEditorState}
                        mitoAPI={mitoAPI}
                        tab={uiState.selectedColumnControlPanelTab}
                        lastStepIndex={lastStepSummary.step_idx}
                        lastStepType={lastStepSummary.step_type}
                        analysisData={analysisData}
                    />
                )
            case TaskpaneType.UPGRADE_TO_PRO: return (
                <UpgradeToProTaskpane
                    mitoAPI={mitoAPI}
                    userProfile={userProfile}
                    setUIState={setUIState}
                />
            )
            case TaskpaneType.DOWNLOAD: return (
                <DownloadTaskpane
                    dfNames={dfNames}
                    userProfile={userProfile}
                    selectedSheetIndex={uiState.selectedSheetIndex}
                    uiState={uiState}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    sheetDataArray={sheetDataArray}
                />
            )
            case TaskpaneType.DROP_DUPLICATES: return (
                <DropDuplicatesTaskpane
                    dfNames={dfNames}
                    selectedSheetIndex={uiState.selectedSheetIndex}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    sheetDataArray={sheetDataArray}
                    analysisData={analysisData}
                />
            )
            case TaskpaneType.GRAPH: return (
                <GraphSidebar 
                    graphID={uiState.currOpenTaskpane.graphID}
                    graphSidebarTab={uiState.currOpenTaskpane.graphSidebarTab}
                    dfNames={dfNames}
                    columnIDsMapArray={columnIDsMapArray}
                    sheetDataArray={sheetDataArray}
                    mitoAPI={mitoAPI}
                    setUIState={setUIState} 
                    uiState={uiState}
                    graphDataDict={analysisData.graphDataDict}
                    analysisData={analysisData}
                    mitoContainerRef={mitoContainerRef}
                    userProfile={userProfile}
                />
            )
            case TaskpaneType.IMPORT_FILES: return (
                <ImportTaskpane
                    mitoAPI={mitoAPI}
                    analysisData={analysisData}
                    userProfile={userProfile}
                    setUIState={setUIState}

                    currPathParts={currPathParts}
                    setCurrPathParts={setCurrPathParts}
                />
            )
            case TaskpaneType.MERGE: return (
                <MergeTaskpane
                    selectedSheetIndex={uiState.selectedSheetIndex}
                    sheetDataArray={sheetDataArray}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    analysisData={analysisData}
                />
            )
            case TaskpaneType.CONCAT: return (
                <ConcatTaskpane
                    analysisData={analysisData}
                    sheetDataArray={sheetDataArray}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                />
            )
            case TaskpaneType.NONE: return (
                <Fragment/>
            )
            case TaskpaneType.PIVOT: return (
                <PivotTaskpane
                    dfNames={dfNames}
                    sheetDataArray={sheetDataArray}
                    columnIDsMapArray={columnIDsMapArray}
                    mitoAPI={mitoAPI}
                    sourceSheetIndex={uiState.currOpenTaskpane.sourceSheetIndex}
                    analysisData={analysisData}
                    setUIState={setUIState}
                    destinationSheetIndex={uiState.currOpenTaskpane.destinationSheetIndex}
                    existingPivotParams={uiState.currOpenTaskpane.existingPivotParams}
                />
            )
            case TaskpaneType.SPLIT_TEXT_TO_COLUMNS: return (
                <SplitTextToColumnsTaskpane
                    mitoAPI={mitoAPI}
                    analysisData={analysisData}
                    sheetDataArray={sheetDataArray}
                    selectedSheetIndex={uiState.selectedSheetIndex}
                    setUIState={setUIState}
                    dfNames={dfNames}
                    startingColumnID={uiState.currOpenTaskpane.startingColumnID}
                />
            )
            case TaskpaneType.STEPS: return (
                <StepsTaskpane
                    stepSummaryList={analysisData.stepSummaryList}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    currStepIdx={analysisData.currStepIdx}
                />
            )
            case TaskpaneType.IMPORT_FIRST: return (
                <DefaultEmptyTaskpane
                    setUIState={setUIState}
                    message={uiState.currOpenTaskpane.message}
                />
            )
            case TaskpaneType.FILL_NA: return (
                <FillNaTaskpane
                    setUIState={setUIState} 
                    uiState={uiState} 
                    mitoAPI={mitoAPI} 
                    selectedSheetIndex={uiState.selectedSheetIndex} 
                    sheetDataArray={sheetDataArray}   
                    analysisData={analysisData}    
                    startingColumnIDs={uiState.currOpenTaskpane.startingColumnIDs}         
                />
            )
            case TaskpaneType.MELT: return (
                <MeltTaskpane
                    userProfile={userProfile}
                    analysisData={analysisData}
                    sheetDataArray={sheetDataArray}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    selectedSheetIndex={uiState.selectedSheetIndex}
                />
            )
            case TaskpaneType.SET_DATAFRAME_FORMAT: return (
                <SetDataframeFormatTaskpane
                    userProfile={userProfile}
                    analysisData={analysisData}
                    sheetDataArray={sheetDataArray}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    selectedSheetIndex={uiState.selectedSheetIndex}
                />
            )
            case TaskpaneType.CONDITIONALFORMATTING: return (
                <ConditionalFormattingTaskpane
                    userProfile={userProfile}
                    analysisData={analysisData}
                    sheetDataArray={sheetDataArray}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    selectedSheetIndex={uiState.selectedSheetIndex}
                />
            )
            case TaskpaneType.DATAFRAMEIMPORT: return (
                <DataframeImportTaskpane
                    userProfile={userProfile}
                    analysisData={analysisData}
                    sheetDataArray={sheetDataArray}
                    setUIState={setUIState}
                    mitoAPI={mitoAPI}
                    selectedSheetIndex={uiState.selectedSheetIndex}
                />
            )
            case TaskpaneType.UPDATEIMPORTS: return (
                <UpdateImportsTaskpane
                    mitoAPI={mitoAPI}
                    sheetDataArray={sheetDataArray}
                    setUIState={setUIState}
                    userProfile={userProfile}
                    analysisData={analysisData}
    
                    currPathParts={currPathParts}
                    setCurrPathParts={setCurrPathParts}
    
                    failedReplayData={uiState.currOpenTaskpane.failedReplayData}
                />
            )

            
            // AUTOGENERATED LINE: GETCURROPENTASKPANE (DO NOT DELETE)
        }
    }

    const getCurrOpenPopup = (popupLocation: PopupLocation): JSX.Element => {
        const popupLocationInfo = uiState.currOpenPopups[popupLocation]
        switch(popupLocationInfo.type) {
            case PopupType.EphemeralMessage: 
                return (
                    <EphemeralMessage 
                        message={popupLocationInfo.message}
                        setUIState={setUIState}
                        popupLocation={popupLocation}
                    />
                )
            case PopupType.None: return (
                <Fragment/>
            )
        }
    }
            

    /*
        Actions that the user can choose to take. We abstract them into this dictionary so they can be used
        across the codebase without replicating functionality. 
    */
    const actions = createActions(
        sheetDataArray, 
        gridState, 
        dfSources, 
        closeOpenEditingPopups, 
        setEditorState, 
        uiState,
        setUIState, 
        setGridState,
        mitoAPI, 
        mitoContainerRef,
        analysisData,
        userProfile
    )


    // Hook for using keyboard shortcuts. NOTE: do not return before this hook, it will cause
    // issues.
    useKeyboardShortcuts(mitoContainerRef, actions, setGridState);

    /* 
        We currrently send all users through the intro tour.

        This returns the tour JSX to display, which might be nothing
        if the user should not go through the tour for some reason.
    */
    const getCurrTour = (): JSX.Element => {

        // If the user has either no or tutorial data in the tool, don't display the tour
        if (analysisData.dataTypeInTool === DataTypeInMito.NONE || analysisData.dataTypeInTool === DataTypeInMito.TUTORIAL) {
            return <></>;
        }

        const toursToDisplay: TourName[] = []

        // We display the INTRO to users if they have not received it
        if (!userProfile.receivedTours.includes(TourName.INTRO)) {
            toursToDisplay.push(TourName.INTRO);
        }

        // If we open the cell editor for the first time, we give the user this tour
        if (editorState !== undefined && editorState.rowIndex >= 0 && !userProfile.receivedTours.includes(TourName.COLUMN_FORMULAS)) {
            toursToDisplay.push(TourName.COLUMN_FORMULAS)
        }

        return (
            <>
                {toursToDisplay.length !== 0 && uiState.currOpenModal.type !== ModalEnum.SignUp &&
                    <Tour 
                        sheetData={sheetDataArray[uiState.selectedSheetIndex]}
                        setHighlightPivotTableButton={setHighlightPivotTableButton}
                        setHighlightAddColButton={setHighlightAddColButton}
                        tourNames={toursToDisplay}
                        mitoAPI={mitoAPI}
                    />
                }
            </>
        )
    }

    // Check which taskpanes are open
    const taskpaneOpen = uiState.currOpenTaskpane.type !== TaskpaneType.NONE;
    const graphTaskpaneOpen = uiState.currOpenTaskpane.type === TaskpaneType.GRAPH && uiState.selectedTabType === 'graph';
    const narrowTaskpaneOpen = taskpaneOpen && !graphTaskpaneOpen;

    /* 
        We detect whether the taskpane is open in wide mode, narrow mode, or not open at all. We then
        set the class of the div containing the Mitosheet and Formula bar, as well as the taskpane div accordingly.
        The class sets the width of the sheet. 
    */
    const formulaBarAndSheetClassNames = classNames('mito-formula-bar-and-mitosheet-div', {
        'mito-formula-bar-and-mitosheet-div-fullscreen-taskpane-open': graphTaskpaneOpen,
        'mito-formula-bar-and-mitosheet-div-narrow-taskpane-open': narrowTaskpaneOpen
    })

    const taskpaneClassNames = classNames({
        'mito-default-taskpane': !taskpaneOpen,
        'mito-default-fullscreen-taskpane-open': graphTaskpaneOpen,
        'mito-default-narrow-taskpane-open': narrowTaskpaneOpen,
    })

    return (
        <div className="mito-container" data-jp-suppress-context-menu ref={mitoContainerRef} tabIndex={0}>
            <ErrorBoundary mitoAPI={mitoAPI}>
                <Toolbar 
                    mitoAPI={mitoAPI}
                    currStepIdx={analysisData.currStepIdx}
                    lastStepIndex={lastStepSummary.step_idx}
                    highlightPivotTableButton={highlightPivotTableButton}
                    highlightAddColButton={highlightAddColButton}
                    actions={actions}
                    mitoContainerRef={mitoContainerRef}
                    gridState={gridState}
                    setGridState={setGridState}
                    uiState={uiState}
                    setUIState={setUIState}
                    sheetData={sheetDataArray[uiState.selectedSheetIndex]}
                    userProfile={userProfile}
                    setEditorState={setEditorState}
                    analysisData={analysisData}
                    sheetIndex={uiState.selectedSheetIndex}
                />
                <div className="mito-main-sheet-div" id="mito-main-sheet-div"> 
                    <div className={formulaBarAndSheetClassNames}>
                        <EndoGrid
                            sheetDataArray={sheetDataArray}
                            mitoAPI={mitoAPI}
                            uiState={uiState}
                            setUIState={setUIState}
                            sheetIndex={uiState.selectedSheetIndex}
                            gridState={gridState}
                            setGridState={setGridState}
                            editorState={editorState}
                            setEditorState={setEditorState}
                            mitoContainerRef={mitoContainerRef}
                            closeOpenEditingPopups={closeOpenEditingPopups}
                        />
                    </div>
                    {uiState.currOpenTaskpane.type !== TaskpaneType.NONE && 
                        <div className={taskpaneClassNames}>
                            {getCurrOpenTaskpane()}
                        </div>
                    }
                </div>
                {/* Display the tour if there is one */}
                {getCurrTour()}
                <Footer
                    sheetDataArray={sheetDataArray}
                    graphDataDict={analysisData.graphDataDict}
                    gridState={gridState}
                    setGridState={setGridState}
                    mitoAPI={mitoAPI}
                    closeOpenEditingPopups={closeOpenEditingPopups}
                    uiState={uiState}
                    setUIState={setUIState}
                    mitoContainerRef={mitoContainerRef}
                    setEditorState={setEditorState}
                />
                {getCurrentModalComponent()}
                <BottomLeftPopup
                    loading={uiState.loading}
                    sheetDataArray={sheetDataArray}
                    userProfile={userProfile}
                    analysisData={analysisData}
                    mitoAPI={mitoAPI}
                    currOpenModal={uiState.currOpenModal}
                    actions={actions}
                    setUIState={setUIState}
                />
                {getCurrOpenPopup(PopupLocation.TopRight)}
                
                {/* 
                    If the step index of the last step isn't the current step,
                    then we are out of date, and we tell the user this.
                */}
                {analysisData.currStepIdx !== lastStepSummary.step_idx && 
                    <CatchUpPopup
                        fastForward={() => {
                            void mitoAPI.updateCheckoutStepByIndex(lastStepSummary.step_idx);
                        }}
                    />
                }
            </ErrorBoundary>
        </div>
    );
}


export default Mito;