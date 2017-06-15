/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import ol from 'openlayers';
import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {List, ListItem} from 'material-ui/List';
import Place from 'material-ui/svg-icons/maps/place';

import {zoomToExtent} from '../actions/MapActions';
import ImgIcon from './ImgIcon';


class GeocodingResult extends React.Component {
  static propTypes = {
    /** Object definition of the result.
     */
    result: React.PropTypes.object,
    /**
     * zoomToExtent is provided by the connect function.
     */
    zoomToExtent: React.PropTypes.func
  }

  formatDisplayName(result) {
    const placeType = result.address[Object.keys(result.address)[0]];
    if (placeType) {
      const displayName = result.display_name.slice(placeType.length);
      return (<span className="locationDetails"><span className="place">{placeType}</span>{displayName}</span>)
    }

    return (<span>{result.display_name}</span>);
  }

  zoomTo(result) {
    // convert the bounding box
    const in_bbox = result.boundingbox;
    const in_extent = [
      parseFloat(in_bbox[2]), parseFloat(in_bbox[0]),
      parseFloat(in_bbox[3]), parseFloat(in_bbox[1])
    ];

    // TODO: This should come from the state.
    const map_proj = 'EPSG:3857';
    const out_extent = ol.proj.transformExtent(in_extent, 'EPSG:4326', map_proj);

    this.props.zoomToExtent(out_extent);
  }

  render() {
    const result = this.props.result;

    let icon = null;
    if (result.icon) {
      // The OSM geocoder returns URLs to images,
      //  this "shims" the material-ui icon renderer
      //  to use an <img>.
      icon = (<ImgIcon src={result.icon} />);
    } else {
      // send it? There might be a better icon for this.
      icon = (<Place/>);
    }

    const zoom_to = () => {
      this.zoomTo(result);
    };

    return (
      <ListItem
        className='geocoding-result'
        leftIcon={icon}
        key={result.place_id}
        onTouchTap={zoom_to}>
          {this.formatDisplayName(result)}
      </ListItem>
    );
  }
}

/**
 * Geocoding Results list.
 *
 * Used by the Geocoding component to render the
 * the results list.
 */
class GeocodingResults extends React.Component {
  static propTypes = {
    /** Object definition of the result.
     */
    results: React.PropTypes.arrayOf(React.PropTypes.object),
    /**
     * zoomToExtent is provided by the connect function.
     */
    zoomToExtent: React.PropTypes.func,
    /**
     * Toggle visibility of the list.
     */
    show: React.PropTypes.bool,
    /**
     * Supplemental classNames
     */
    className: React.PropTypes.string
  }

  render() {
    // map all of the results to GeocodingResult items
    const items = this.props.results.map((item, idx) => {
      return (<GeocodingResult key={'result' + idx} zoomToExtent={this.props.zoomToExtent} result={item}/>);
    });

    // TODO: Should this move to a class?
    const style = {};
    if (this.props.show && this.props.results.length > 0) {
      style.display = 'block';
    }

    return (
      <div style={style} className={classNames('sdk-component geocoding-results-panel', this.props.className)}>
        <List>
          {items}
        </List>
      </div>
    );
  }
}

// Maps state from store to props
// Currently a placeholder. The list does not use any information
// from the state to render, instead using props.results.
const mapStateToProps = (state, ownProps) => {
  return {}
};

// Maps actions to props
const mapDispatchToProps = (dispatch) => {
  return {
    // You can now say this.props.createBook
    zoomToExtent: (extent) => dispatch(zoomToExtent(extent))
  }
};

// Use connect to put them together
export default connect(mapStateToProps, mapDispatchToProps)(GeocodingResults);
