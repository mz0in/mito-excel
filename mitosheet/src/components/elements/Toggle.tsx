// Copyright (c) Mito
import React from 'react';

// import css
import '../../../css/elements/Toggle.css'


interface ToggleProps {
    /** 
        * @param value - The state of the toggle. True (On) or False (Off)
    */
    value: boolean;

    /**
        * @param onChange - Handles actually changing the value of the filter 
    */
    onChange: () => void;
}

/**
 * The Toggle component. If open, the select dropdown automatically 
 * closes when the user clicks.
 * 
 * The Toggle component utilizes the html input element with a type checkbox, so that we 
 * follow the design patterns of html elements. In order to create our custom designed toggle, 
 * we hide the default html checkbox and style the label property. 
 * 
 * Inspired by: https://stackoverflow.com/questions/39846282/how-to-add-the-text-on-and-off-to-toggle-button and 
 * https://www.youtube.com/watch?v=N8BZvfRD_eU
 */
const Toggle = (props: ToggleProps): JSX.Element => {

    return (
        <label className="toggle-label" >
            {/* 
                Its important that the onClick event handler be on the input instead of the label because
                when the label is clicked, it also triggers the input's onClick event. If the onClick was registered
                on the label, this would cause it to be fired twice each time the user clicks.  
            */}
            <input type="checkbox" checked={props.value} onClick={() => { props.onChange() }} />
            <div className="toggle"></div>
        </label>
    )
}

export default Toggle;