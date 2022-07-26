import React, {useState} from "react";
import {getValByConfig} from "../../util/util";
import "./ImageGalleryMulti.scss";

import Carousel from "react-multi-carousel";
import Concat from "../Concat/Concat";
import "react-multi-carousel/lib/styles.css";
import {Modal} from "react-bootstrap";
import _ from "lodash";
import DateTime from '../DateTime/DateTime';
import Value from "../Value/Value";


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
 * @prop {object} config  ImageGalleryMulti configuration object.
 * @example
 * {
 *    "component": "ImageGalleryMulti",
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
const ImageGalleryMulti: React.FC<Props> = (props) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const {data, config} = props;
  let images = getValByConfig(data, config?.images);
  images = _.isNil(images) ? null : (Array.isArray(images) ? images : [images]);
  const imageStyle = config?.style ? config.style : {};

  const nodalDataValues = () => {
    const {modal: {items}} = config;
    let values = [];
    values = items.map((item, index) => {
      if (!item) return null;
      const {component, label, path, config} = item
      let value: any = path ? _.get(selectedImage, path, null) : null;
      if (!value) return null;
      return (
        <div className="metadata-row" key={"meta-" + index}>
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
    const {images: {url}, modal: {title: {component, path, config:titleConfig}}} = config;
    let urlValue: any = _.get(selectedImage, url, null);
    let titleValue: any = path ? _.get(selectedImage, path, null) : null;
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
      let urlValue: any = _.get(item, config?.images?.url, []);
      return (
        <div key={index} style={imageStyle} data-testid={`item-${index}`}>
          <img
            className="d-block w-100 image-item"
            src={urlValue}
            alt="First slide"
            onClick={() => handleSelectedImage(item)}
          />
        </div>
      );
    });
    return carouselItems ? carouselItems : [];
  };

  const responsive = {
    desktop: {
      breakpoint: {max: 3000, min: 1024},
      items: 3,
      slidesToSlide: 3
    },
    tablet: {
      breakpoint: {max: 1024, min: 464},
      items: 2,
      slidesToSlide: 2
    },
    mobile: {
      breakpoint: {max: 464, min: 0},
      items: 1,
      slidesToSlide: 1
    }
  };

  return (
    <div className="ImageGalleryMulti" data-testid="ImageGalleryMulti-component">
      <div className="ImageGalleryMultiContainer">
        <Carousel
          responsive={responsive}
          infinite={true}
          autoPlay={true}
          centerMode={false}>
          {getItems()}
        </Carousel>
      </div>
      <CenteredModal
        show={selectedImage !== null ? true : false}
        onHide={() => setSelectedImage(null)}
      />
    </div>);
};

export default ImageGalleryMulti;