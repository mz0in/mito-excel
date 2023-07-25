
// Copyright (c) Mito

import React from 'react';

const EyeIcon = (props: {variant: 'selected' | 'unselected', onClick: () => void}): JSX.Element => {
    if (props.variant === 'selected') {
        return (
            <svg onClick={props.onClick} width="18" height="11" viewBox="0 0 18 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.8 0C4.9621 0 1.6346 2.2352 0 5.5C1.6346 8.7648 4.9621 11 8.8 11C12.6379 11 15.9654 8.7648 17.6 5.5C15.9654 2.2352 12.6379 0 8.8 0ZM13.1395 2.9172C14.1735 3.5772 15.0502 4.4605 15.708 5.5C15.0502 6.5406 14.1735 7.4239 13.1395 8.0828C11.8404 8.9111 10.34 9.35 8.8011 9.35C7.2622 9.35 5.7618 8.9122 4.4616 8.0828C3.4276 7.4228 2.5509 6.5395 1.8931 5.5C2.5509 4.4594 3.4276 3.5761 4.4616 2.9172C4.5287 2.8743 4.5969 2.8325 4.6651 2.7918C4.4935 3.2615 4.4 3.7686 4.4 4.2977C4.4 6.7276 6.3701 8.6977 8.8 8.6977C11.2299 8.6977 13.2 6.7276 13.2 4.2977C13.2 3.7686 13.1065 3.2615 12.9349 2.7918C13.0031 2.8325 13.0724 2.8743 13.1395 2.9172ZM8.8 3.85C8.8 4.7608 8.0608 5.5 7.15 5.5C6.2392 5.5 5.5 4.7608 5.5 3.85C5.5 2.9392 6.2392 2.2 7.15 2.2C8.0608 2.2 8.8 2.9392 8.8 3.85Z" fill="var(--mito-highlight)"/>
            </svg>
        )
    } else {
        return (
            <svg onClick={props.onClick} width="19" height="11" viewBox="0 0 19 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.65693 0C5.81903 0 2.49153 2.2352 0.856934 5.5C2.49153 8.7648 5.81903 11 9.65693 11C13.4948 11 16.8223 8.7648 18.4569 5.5C16.8223 2.2352 13.4948 0 9.65693 0ZM13.9964 2.9172C15.0304 3.5772 15.9071 4.4605 16.5649 5.5C15.9071 6.5406 15.0304 7.4239 13.9964 8.0828C12.6973 8.9111 11.1969 9.35 9.65803 9.35C8.11913 9.35 6.61873 8.9122 5.31853 8.0828C4.28453 7.4228 3.40783 6.5395 2.75003 5.5C3.40783 4.4594 4.28453 3.5761 5.31853 2.9172C5.38563 2.8743 5.45383 2.8325 5.52203 2.7918C5.35043 3.2615 5.25693 3.7686 5.25693 4.2977C5.25693 6.7276 7.22703 8.6977 9.65693 8.6977C12.0868 8.6977 14.0569 6.7276 14.0569 4.2977C14.0569 3.7686 13.9634 3.2615 13.7918 2.7918C13.86 2.8325 13.9293 2.8743 13.9964 2.9172ZM9.65693 3.85C9.65693 4.7608 8.91773 5.5 8.00693 5.5C7.09613 5.5 6.35693 4.7608 6.35693 3.85C6.35693 2.9392 7.09613 2.2 8.00693 2.2C8.91773 2.2 9.65693 2.9392 9.65693 3.85Z" fill="#767180"/>
            </svg>
        )
    }
    
}

export default EyeIcon;





