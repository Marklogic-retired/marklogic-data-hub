import React, {useState} from 'react';
import {Carousel} from 'react-bootstrap';
import Concat from "../Concat/Concat";
import DateTime from '../DateTime/DateTime';
import {Modal} from "react-bootstrap";
import Value from '../Value/Value';
import {getValByPath, getValByConfig} from '../../util/util';
import "./ImageGallery.scss";
import _ from "lodash";

type Props = {
  data?: any;
  config?: any;
  style?: React.CSSProperties
};

const COMPONENTS = {
  Concat: Concat,
  DateTime: DateTime,
  Value: Value
};

/**
 * Component for showing one or more values for a Membership view.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object} config  ImageGallery configuration object.
 * @example
 * {
 *    "component": "ImageGallery",
      "config": {
        "style": {
          "height": "150px",
          "width": "150px"
        },
        "images": {
          "url": {
            "arrayPath": "person.images.image",
            "path": "url"
          }
        },
        "modal": {
          "title": {
            "component": "Value",
            "path": "url",
            "config": {
              "style": {
                "fontStyle": "bold"
              }
            }
          },
          "items": [
            {
              "component": "Value",
              "label": "Source",
              "path": "source.name",
              "config": {}
            },
            {
              "component": "DateTime",
              "label": "Uploaded on",
              "path": "source.ts",
              "config": {
                "format": "MMMM dd, yyyy"
              }
            },
            {
              "component": "Value",
              "label": "Uploaded by",
              "path": "source.uploadedBy",
              "config": {
                "className": "foo"
              }
            }
          ]
        },
        "download": true
      }
    }
 */
const ImageGallery: React.FC<Props> = (props) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const {data, config} = props;
  let images = getValByConfig(data, config?.images);
  images = _.isNil(images) ? null : (Array.isArray(images) ? images : [images]);
  const singleImage = images && images?.length === 1;
  const carouselContainerStyle = config?.style ? config.style : {}

  const nodalDataValues = () => {
    const {modal: {items}} = config;
    let values = [];
    values = items.map((item, index) => {
      if (!item) return null;
      const {component, label, path, config} = item
      let value: any = path ? getValByPath(selectedImage, path) : null;
      if (!value) return null;
      return (
        <div className="metadata-row">
          <span className="metadata-label">{label}</span>
          <span className="metadata-value">
            {React.createElement(
              COMPONENTS[component],
              {config: config}, value
            )}
          </span>
        </div>
      )
    })
    return values;
  }

  const CenteredModal = (props) => {
    const {images: {url}, modal: {title: {component, path, config: titleConfig}}} = config;
    let urlValue: any = (url && selectedImage) ? getValByPath(selectedImage, url) : null;
    let titleValue: any = (path && selectedImage) ? getValByPath(selectedImage, path) : null;
    return (
      <Modal
        {...props}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        contentClassName="image-gallery-modal"

      >
        <Modal.Header closeButton>
          {titleValue && <Modal.Title id="contained-modal-title-vcenter">
            {React.createElement(
              COMPONENTS[component],
              {config: titleConfig}, titleValue
            )}
          </Modal.Title>}
        </Modal.Header>
        <Modal.Body>
          <div>
            {selectedImage && <img
              className="d-block w-100"
              src={urlValue}
              alt="First slide"
            />}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="metadata-container">
            {nodalDataValues()}
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  const handleSelectedImage = (image) => {
    setSelectedImage(image);
  };

  const getItems = () => {
    const carouselItems = images?.map((item, index) => {
      let urlValue: any = getValByPath(item, config?.images?.url);
      return (
        <Carousel.Item key={index}>
          <div data-testid={`item-${index}`}>
            <img
              className="d-block w-100"
              src={urlValue}
              alt="First slide"
              onClick={() => handleSelectedImage(item)}
            />
          </div>
        </Carousel.Item>
      )
    });
    return carouselItems ? carouselItems : []
  }
  return (
    <div className="ImageGallery" data-testid="ImageGallery-component">
      <div className="carouselContainer" style={carouselContainerStyle}>
        <Carousel controls={!singleImage} indicators={!singleImage} variant="dark" >
          {getItems()}
        </Carousel>
      </div>
      <CenteredModal
        show={selectedImage !== null ? true : false}
        onHide={() => setSelectedImage(null)}
      />
    </div>)
}

export default ImageGallery