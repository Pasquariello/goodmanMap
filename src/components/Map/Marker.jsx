
import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '@iconify/react'
import locationIcon from '@iconify/icons-mdi/map-marker'

export default function Marker({branch, show}) {
    const marker_width = 40;
	const marker_height = 64;

	const marker = {
		// initially any map object has left top corner at lat lng coordinates
		// it's on you to set object origin to 0,0 coordinates
		position: 'absolute',
		width: marker_width,
		height: marker_height,
		left: -marker_width / 2,
		top: -marker_height / 2,
		color: 'white',
		cursor: 'pointer',	
	};

	return (
        <div style={marker}>
            <Icon icon={locationIcon} className="pin-icon" />
            <p className="pin-text">Text</p>

            {show === branch._id && (
				<div
					style={{
						background: 'rgba(0,0,0,0.6)',
						borderRadius: '10px',
						padding: '20px',
						width: 200,
					}}
				>

					<p><b>Branch Name:</b> {branch.branchName}</p>
					<p><b>Address:</b> {branch.address}</p>
					<p>{branch.city}, {branch.state}, {branch.country}</p>
					<p><b>Zip Code:</b> {branch.zip}</p>

				</div>
			)}
        </div>
	);
}

Marker.propTypes = {
	branch: PropTypes.object,
	show: PropTypes.string,
}
