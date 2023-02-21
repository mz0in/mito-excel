
#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Saga Inc.
# Distributed under the terms of the GPL License.

import pandas as pd
from time import perf_counter
from typing import Any, Dict, List, Optional, Set, Tuple
from mitosheet.code_chunks.code_chunk import CodeChunk
from mitosheet.code_chunks.ai_transformation_code_chunk import AITransformationCodeChunk

from mitosheet.state import State
from mitosheet.step_performers.step_performer import StepPerformer
from mitosheet.step_performers.utils import get_param
from mitosheet.ai.recon import exec_and_get_new_state_and_last_line_expression_value

class AITransformationStepPerformer(StepPerformer):
    """
    Allows you to execute an arbitrary chunk of code, generated by an AI.
    """

    @classmethod
    def step_version(cls) -> int:
        return 1

    @classmethod
    def step_type(cls) -> str:
        return 'ai_transformation'

    @classmethod
    def execute(cls, prev_state: State, params: Dict[str, Any]) -> Tuple[State, Optional[Dict[str, Any]]]:
        user_input: str = get_param(params, 'user_input')
        prompt_version: str = get_param(params, 'prompt_version')
        prompt: str = get_param(params, 'prompt')
        completion: str = get_param(params, 'completion')
        edited_completion: str = get_param(params, 'edited_completion')

        pandas_start_time = perf_counter()
        post_state, last_line_value = exec_and_get_new_state_and_last_line_expression_value(prev_state, edited_completion)
        pandas_processing_time = perf_counter() - pandas_start_time

        # If the last line value is a primitive, we return it as a result for the frontend
        result_last_line_value = None
        if isinstance(last_line_value, str) or isinstance(last_line_value, bool) or isinstance(last_line_value, int) or isinstance(last_line_value, float):
            result_last_line_value = last_line_value

        return post_state, {
            'pandas_processing_time': pandas_processing_time,
            'last_line_is_dataframe': isinstance(last_line_value, pd.DataFrame),
            'result': {
                'last_line_value': result_last_line_value
            }
        }

    @classmethod
    def transpile(
        cls,
        prev_state: State,
        post_state: State,
        params: Dict[str, Any],
        execution_data: Optional[Dict[str, Any]],
    ) -> List[CodeChunk]:
        return [
            AITransformationCodeChunk(
                prev_state, 
                post_state, 
                get_param(params, 'user_input'),
                get_param(params, 'edited_completion'),
                get_param(execution_data if execution_data is not None else {}, 'last_line_is_dataframe')
            )
        ]

    @classmethod
    def get_modified_dataframe_indexes(cls, params: Dict[str, Any]) -> Set[int]:
        return set() # TODO: add the modified indexes here!

    @classmethod
    def get_created_dataframe_indexes(cls, params: Dict[str, Any]) -> Set[int]:
        return {-1} # TODO: add the modified indexes here!
    