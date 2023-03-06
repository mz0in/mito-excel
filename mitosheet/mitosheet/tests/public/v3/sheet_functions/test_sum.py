#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Saga Inc.
# Distributed under the terms of the GPL License.
"""
Contains tests for the SUM function.
"""

import pytest
import pandas as pd
import numpy as np
from mitosheet.public.v3.rolling_range import RollingRange

from mitosheet.public.v3.sheet_functions.number_functions import SUM


SUM_VALID_TESTS = [
    # Just constant tests
    ([2, 3], 5),
    ([2.0, 3.0], 5.0),
    ([2.0, '$3.0'], 5.0),
    ([2.0, True], 3.0),

    # Constants and series
    ([2, pd.Series([1,2,3])], pd.Series([3,4,5])),
    ([2.0, pd.Series([1,2,3])], pd.Series([3.0,4.0,5.0])),
    ([2.0, pd.Series([1,2,None])], pd.Series([3.0,4.0,None])),
    ([2.0, pd.Series(['1', '2', '3'])], pd.Series([3.0, 4.0, 5.0])),
    ([2.0, pd.Series(['1.0', '2.0', '3.0'])], pd.Series([3.0, 4.0, 5.0])),
    ([2.0, pd.Series(['$1.00', '$2.00', '$3.00'])], pd.Series([3.0, 4.0, 5.0])),
    
    # Dataframes
    ([pd.DataFrame({'a': [1, 1, 1], 'b': [2, 2, 2]}), pd.Series([1,2,3])], pd.Series([10,11,12])),
    ([pd.DataFrame({'a': [1, 1, 1], 'b': [2, 2, 2]}), 2], 11),
    ([pd.DataFrame({'a': ['$1', '$1', '$1'], 'b': [2, None, 2]}), pd.Series([1,2,3])], pd.Series([8.0,9.0,10.0])),

    # Rolling ranges
    ([RollingRange(pd.DataFrame({'B': [1, 2, 3], 'C': [4, 5, 6]}), 2, 0), 1], pd.Series([13, 17, 10])), #A0 = B0:C1 + 1
    ([RollingRange(pd.DataFrame({'B': [1, 2, 3], 'C': [4, 5, 6]}), 2, -1), 1], pd.Series([6, 13, 17])), #A1 = B0:C1 + 1
    ([RollingRange(pd.DataFrame({'B': [1, 2, 3], 'C': [4, 5, 6]}), 2, 1), 1], pd.Series([17, 10, 1])), #A0 = B1:C2 + 1
    ([RollingRange(pd.DataFrame({'B': [1, 2, 3], 'C': [4, 5, 6]}), 3, -1), 1], pd.Series([13, 22, 17])), #A1 = B0:C2 + 1
]

SUM_INVALID_CAST_TESTS = [
    # Constants
    (['abc', 2], 2),
    (['abc', 'def'], 0),

    # Series
    ([2, 'abc', pd.Series([1,2,3])], pd.Series([3,4,5])),
    (['abc', pd.Series([1,2,3])], pd.Series([1,2,3])),
    ([2, pd.Series(['abc',2,3])], pd.Series([np.NaN,4.0,5.0])),

    # Dataframes
    ([pd.DataFrame({'a': [1, 1, 1], 'b': [2, 2, 'abc']}), pd.Series([1,2,3])], pd.Series([8.0,9.0,10.0])),
    ([pd.DataFrame({'a': [1, 1, 1], 'b': [2, 2, 'abc']}), pd.Series([1,2,'abc'])], pd.Series([8.0,9.0,np.NaN])),

    # Rolling ranges
    ([RollingRange(pd.DataFrame({'B': [1, 2, 'abc'], 'C': [4, 5, 6]}), 2, 0), 1], pd.Series([13.0, 14.0, 7.0])),
    ([RollingRange(pd.DataFrame({'B': [1, 2, 'abc'], 'C': [4, 5, 6]}), 2, 0), 1, pd.Series([1,2,3])], pd.Series([14.0, 16.0, 10.0])),
    ([RollingRange(pd.DataFrame({'B': [1, 2, 'abc'], 'C': [4, 5, 6]}), 2, 0), 1, pd.Series([1,2,None])], pd.Series([14.0, 16.0, None])),
]

@pytest.mark.parametrize("_argv,expected", SUM_VALID_TESTS + SUM_INVALID_CAST_TESTS)
def test_sum(_argv, expected):
    result = SUM(*_argv)
    print(result)
    if isinstance(result, pd.Series):
        assert result.equals(expected)
    else: 
        assert result == expected

