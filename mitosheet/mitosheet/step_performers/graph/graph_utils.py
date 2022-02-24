#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Saga Inc.
# Distributed under the terms of the GPL License.

# Graph types should be kept consistent with the GraphType in GraphSidebar.tsx
from typing import Dict, List, Optional
import io

from mitosheet.types import ColumnHeader
import plotly.graph_objects as go


SCATTER = "scatter"
BAR = "bar"
HISTOGRAM = "histogram"
BOX = "box"

# Label for each type of graph used in the graph title
GRAPH_TITLE_LABELS = {
    SCATTER: "scatter plot",
    BAR: "bar chart",
    BOX: "box plot",
    HISTOGRAM: "histogram",
}


def get_barmode(graph_type: str) -> Optional[str]:
    """
    Helper function for determing the barmode to apply to the graph creation function, depending
    on the type of graph being created
    """
    if graph_type == BOX:
        return "stack"
    elif graph_type == HISTOGRAM:
        return "group"
    elif graph_type == BAR:
        return "group"
    else:
        return None


def create_parameter(param_key: str, param_value: str, format_as_string: bool) -> str:
    """
    Returns the params ready to be used in the transpiled code.
    """
    if format_as_string:
        return f"{param_key}='{param_value}'"
    else:
        return f"{param_key}={param_value}"


def get_graph_title(
    x_axis_column_headers: List[ColumnHeader],
    y_axis_column_headers: List[ColumnHeader],
    filtered: bool,
    graph_type: str,
) -> str:
    """
    Helper function for determing the title of the graph
    """
    # Get the label to let the user know that their graph had a filter applied.
    graph_filter_label: Optional[str] = "(first 1000 rows)" if filtered else None

    # Compile all of the column headers into one comma separated string
    all_column_headers = (", ").join(
        str(s) for s in x_axis_column_headers + y_axis_column_headers
    )
    # Get the title of the graph based on the type of graph
    graph_title_label = GRAPH_TITLE_LABELS[graph_type]

    # Combine all of the non empty graph title components into one list
    graph_title_components = (
        [all_column_headers, graph_filter_label, graph_title_label]
        if graph_filter_label is not None
        else [all_column_headers, graph_title_label]
    )

    # Return a string with all of the graph_title_components separated by a space
    return " ".join(graph_title_components)


def get_html_and_script_from_figure(
    fig: go.Figure, height: int, width: int
) -> Dict[str, str]:
    """
    Given a plotly figure, generates HTML from it, and returns
    a dictonary with the div and script for the frontend.

    The plotly HTML generated by the write_html function call is a div with two children:
    1. a div that contains the id for the graph itself
    2. a script that actually builds the graph

    Because we have to dynamically execute the script, we split these into two
    strings, to make them easier to do what we need on the frontend
    """
    # Send the graph back to the frontend
    buffer = io.StringIO()
    fig.write_html(
        buffer,
        full_html=False,
        include_plotlyjs=False,
        default_height=height,
        default_width=width,
    )

    original_html = buffer.getvalue()
    # First, we remove the main div, and the resulting whitespace, to just have the children
    original_html = original_html[5:]
    original_html = original_html[:-6]
    original_html = original_html.strip()

    # Then, we split the children into the div, and the script
    # making sure to remove the script tag (so we can execute it)
    script_start = '<script type="text/javascript">'
    script_end = "</script>"
    split_html = original_html.split(script_start)
    div = split_html[0]
    script = split_html[1][: -len(script_end)]

    return {"html": div, "script": script}
