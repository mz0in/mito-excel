import React from "react";
import ExcelRangeDynamicCondition from "./ExcelRangeDynamicCondition";
import { ExcelRangeDynamicImport, ExcelRangeImportParams } from "./ExcelRangeImportTaskpane";
import Spacer from "../../layout/Spacer";


interface ExcelRangeDynamicSectionProps {
    rangeImport: ExcelRangeDynamicImport,
    index: number,
    setParams: React.Dispatch<React.SetStateAction<ExcelRangeImportParams>>
}
const ExcelRangeDynamicSection = (props: ExcelRangeDynamicSectionProps): JSX.Element => {

    const rangeImport = props.rangeImport;

    return (
        <>
            <ExcelRangeDynamicCondition
                title='Starting Row Condition'
                condition={rangeImport.start_condition}
                setCondition={(newCondition) => {
                    props.setParams((prevParams) => {
                        const newRangeImports = window.structuredClone(prevParams.range_imports);
                        const newRangeImport: ExcelRangeDynamicImport = window.structuredClone(rangeImport);
                        newRangeImport.start_condition = newCondition;
                        newRangeImports[props.index] = newRangeImport;
                        return {
                            ...prevParams,
                            range_imports: newRangeImports
                        }
                    })
                }}
                conditionOptions={{
                    'upper left corner value': {'title': 'Top Left Corner Value', 'subtext': 'Mito will search for this exact value (including whitespace) as the top left corner.', 'placeholderValue': 'start value'},
                    'upper left corner value starts with': {'title': 'Top Left Corner Starts With', 'subtext': 'Mito will search for a cell that starts with this value.', 'placeholderValue': 'start value'},
                    'upper left corner value contains': {'title': 'Top Left Corner Contains', 'subtext': 'Mito will search for a cell that contains with this value.', 'placeholderValue': 'start value'},
                }}
            />
            <Spacer px={10} seperatingLine/>
            <ExcelRangeDynamicCondition
                title='Ending Row Condition'
                condition={rangeImport.end_condition}
                setCondition={(newCondition) => {
                    props.setParams((prevParams) => {
                        const newRangeImports = window.structuredClone(prevParams.range_imports);
                        const newRangeImport: ExcelRangeDynamicImport = window.structuredClone(rangeImport);
                        newRangeImport.end_condition = newCondition;
                        newRangeImports[props.index] = newRangeImport;
                        return {
                            ...prevParams,
                            range_imports: newRangeImports
                        }
                    })
                }}
                conditionOptions={{
                    'first empty cell': {'title': 'First Empty Cell', 'subtext': 'Mito will take all rows until it hits an empty cell in the first column.'},
                    'bottom left corner consecutive empty cells': {'title': 'Consecutive Empty Cells', 'subtext': 'Mito will continue take all rows until it hits at least this number of empty cells in one row.', 'placeholderValue': '4'},
                    'bottom left corner value': {'title': 'Bottom Left Corner Value', 'subtext': 'Mito will search for this exact value (including whitespace) as the bottom left corner.', 'placeholderValue': 'end value'},
                    'bottom left corner value starts with': {'title': 'Bottom Left Corner Starts With', 'subtext': 'Mito will search for a cell that starts with this value.', 'placeholderValue': 'end value'},
                    'bottom left corner value contains': {'title': 'Bottom Left Corner Contains', 'subtext': 'Mito will search for a cell that starts with this value.', 'placeholderValue': 'end value'},
                }}
            />
            <Spacer px={10} seperatingLine/>
            <ExcelRangeDynamicCondition
                title='Ending Column Condition'
                condition={rangeImport.column_end_condition}
                setCondition={(newCondition) => {
                    props.setParams((prevParams) => {
                        const newRangeImports = window.structuredClone(prevParams.range_imports);
                        const newRangeImport: ExcelRangeDynamicImport = window.structuredClone(rangeImport);
                        newRangeImport.column_end_condition = newCondition;
                        newRangeImports[props.index] = newRangeImport;
                        return {
                            ...prevParams,
                            range_imports: newRangeImports
                        }
                    })
                }}
                conditionOptions={{
                    'first empty cell': {'title': 'First Empty Cell', 'subtext': 'Mito will continue take all columns until it hits an empty cell in the first row.'},
                    'num columns': {'title': 'Number of Columns', 'subtext': 'Mito will take this number of columns.', 'placeholderValue': '4'},
                }}
            />
        </>
    )
}

export default ExcelRangeDynamicSection;