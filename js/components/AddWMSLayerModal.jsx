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
import Dialog from 'pui-react-modals';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {doGET} from '../util.js';
import Pui from 'pui-react-alerts';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  title: {
    id: 'addwmslayermodal.title',
    description: 'Title for the modal Add WMS layer dialog',
    defaultMessage: 'Add Layer'
  },
  errormsg: {
    id: 'addwmslayermodal.errormsg',
    description: 'Error message to show the user when a GetCapabilities request fails',
    defaultMessage: 'Error retrieving GetCapabilities. {msg}'
  }
});

@pureRender
class AddWMSLayerModal extends Dialog.Modal {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      layers: []
    };
  }
  componentDidMount() {
    var layers = [];
    doGET(this.props.url + '?service=WMS&request=GetCapabilities&version=1.3.0', function(xmlhttp) {
      var info = new ol.format.WMSCapabilities().read(xmlhttp.responseText);
      var root = info.Capability.Layer;
      this._recurseLayers(root, layers);
      this.setState({layers: layers});
    }, function(xmlhttp) {
      this._setError(xmlhttp.status + ' ' + xmlhttp.statusText);
    }, this);
  }
  _setError(msg) {
    this.setState({
      error: true,
      msg: msg
    });
  }
  _recurseLayers(layer, layers) {
    if (layer.Name) {
      layers.push(layer);
    }
    if (layer.Layer) {
      for (var i = 0, ii = layer.Layer.length; i < ii; ++i) {
        this._recurseLayers(layer.Layer[i], layers);
      }
    }
  }
  _onLayerClick(layer) {
    var map = this.props.map;
    var view = map.getView();
    var EX_GeographicBoundingBox = layer.EX_GeographicBoundingBox;
    if (view.getProjection().getCode() === 'EPSG:3857') {
      EX_GeographicBoundingBox[0] = Math.max(ol.proj.EPSG3857.WORLD_EXTENT[0], EX_GeographicBoundingBox[0]);
      EX_GeographicBoundingBox[1] = Math.max(ol.proj.EPSG3857.WORLD_EXTENT[1], EX_GeographicBoundingBox[1]);
      EX_GeographicBoundingBox[2] = Math.min(ol.proj.EPSG3857.WORLD_EXTENT[2], EX_GeographicBoundingBox[2]);
      EX_GeographicBoundingBox[3] = Math.min(ol.proj.EPSG3857.WORLD_EXTENT[3], EX_GeographicBoundingBox[3]);
    }
    var extent = ol.proj.transformExtent(layer.EX_GeographicBoundingBox, 'EPSG:4326', view.getProjection());
    var wmsLayer = new ol.layer.Tile({
      extent: extent,
      title: layer.Title,
      id: layer.Name,
      isRemovable: true,
      source: new ol.source.TileWMS({
        url: this.props.url,
        params: {
          LAYERS: layer.Name,
          TILED: true
        },
        serverType: 'geoserver'
      })
    });
    map.addLayer(wmsLayer);
    view.fit(extent, map.getSize());
  }
  render() {
    const {formatMessage} = this.props.intl;
    var layers = this.state.layers.map(function(layer) {
      return (<li key={layer.Name}><a title={layer.Abstract || layer.Title} href="#" onClick={this._onLayerClick.bind(this, layer)}>{layer.Title}</a></li>);
    }, this);
    var error;
    if (this.state.error === true) {
      error = (<div className='error-alert'><Pui.ErrorAlert dismissable={false} withIcon={true}>{formatMessage(messages.errormsg, {msg: this.state.msg})}</Pui.ErrorAlert></div>);
    }
    return (
      <Dialog.BaseModal title={formatMessage(messages.title)} show={this.state.isVisible} onHide={this.close} {...this.props}>
        <Dialog.ModalBody>
          <ul>
            {layers}
          </ul>
          {error}
        </Dialog.ModalBody>
      </Dialog.BaseModal>
    );
  }
}

AddWMSLayerModal.propTypes = {
  /**
   * WMS url that will be used to retrieve layers from. Should end with a ? or &.
   */
  url: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(AddWMSLayerModal, {withRef: true});
