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

import React from 'react';
import ol from 'openlayers';
import classNames from 'classnames';
import Button from './Button';
import ZoomIn from 'material-ui/svg-icons/action/zoom-in';
import ZoomOut from 'material-ui/svg-icons/action/zoom-out';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  zoomintitle: {
    id: 'zoom.zoomintitle',
    description: 'Title for the zoom in button',
    defaultMessage: 'Zoom in'
  },
  zoomouttitle: {
    id: 'zoom.zoomouttitle',
    description: 'Title for the zoom out button',
    defaultMessage: 'Zoom out'
  }
});

/**
 * Two buttons to zoom in and out.
 *
 * ```xml
 * <Zoom map={map} />
 * ```
 *
 * ![Zoom](../Zoom.png)
 */
class Zoom extends React.PureComponent {
  static propTypes = {
    /**
     * Animation duration in milliseconds.
     */
    duration: React.PropTypes.number,
    /**
     * The zoom delta applied on each click.
     */
    delta: React.PropTypes.number,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * The ol3 map to use for zooming, only needed if map not provided by context.
     */
    //map: React.PropTypes.instanceOf(ol.Map),
    /**
     * Tooltip to show for zoom in button.
     */
    zoomInTipLabel: React.PropTypes.string,
    /**
     * Tooltip to show for zoom out button.
     */
    zoomOutTipLabel: React.PropTypes.string,
    /**
     * Position of the tooltip.
     */
    tooltipPosition: React.PropTypes.oneOf(['bottom', 'bottom-right', 'bottom-left', 'right', 'left', 'top-right', 'top', 'top-left']),
    /**
     * Style config
     */
    style: React.PropTypes.object,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static contextTypes = {
    map: React.PropTypes.instanceOf(ol.Map),
    muiTheme: React.PropTypes.object
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  static defaultProps = {
    delta: 1,
    duration: 250
  };

  constructor(props, context) {
    super(props);
    this._muiTheme = context.muiTheme || getMuiTheme();
    this.map = context.map || this.props.map;
    //console.log(context.map)
    this.map2 = this.props.mapTest
    if (this.props.hasOwnProperty('getDelta')) {
      this.props.getDelta(this.props.delta)
    }
  }
  getChildContext() {
    return {muiTheme: this._muiTheme};
  }
  _zoomIn() {
    this._zoomByDelta(this.props.delta);
  }
  _zoomOut() {
    this._zoomByDelta(-this.props.delta);
  }
  _zoomByDelta(delta) {
    //var map = this.map;
    var view = this.map.getView();
    var view2 = this.map2.view;
    var currentResolution = view.getResolution();
    console.log(currentResolution);
    var currentResolution2 = view2.resolution;
    console.log(currentResolution2);
    if (currentResolution) {
      var newResolution = view.constrainResolution(currentResolution, delta);
      if (this.props.duration > 0) {
/* TODO: not yet API see https://github.com/openlayers/openlayers/issues/6548
        if (view.getAnimating()) {
          view.cancelAnimations();
        }
*/
        view.animate({
          resolution: newResolution,
          duration: this.props.duration,
          easing: ol.easing.easeOut
        });
      } else {
        view.setResolution(newResolution);
      }
    }
  }
  render() {
    console.log(this.props)
    const {formatMessage} = this.props.intl;
    return (
      <div style={this.props.style} className={classNames('sdk-component zoom', this.props.className)}>
        <Button tooltipPosition={this.props.tooltipPosition} buttonType='Action' mini={true} tooltip={this.props.zoomInTipLabel ? this.props.zoomInTipLabel : formatMessage(messages.zoomintitle)} onTouchTap={this._zoomIn.bind(this)}><ZoomIn /></Button><br/>
        <Button tooltipPosition={this.props.tooltipPosition} buttonType='Action' mini={true} style={{marginTop: 15}} tooltip={this.props.zoomOutTipLabel ? this.props.zoomOutTipLabel : formatMessage(messages.zoomouttitle)} onTouchTap={this._zoomOut.bind(this)}><ZoomOut /></Button>
      </div>
    );
  }
}

export default injectIntl(Zoom);