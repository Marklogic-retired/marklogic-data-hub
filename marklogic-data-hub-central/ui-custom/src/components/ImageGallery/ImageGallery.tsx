import React from 'react';
import {Carousel} from 'react-bootstrap';
import {getValByConfig} from '../../util/util';
import "./ImageGallery.scss";


type Props = {
  data?: any;
  config?: any;
  style?: React.CSSProperties
};

/**
 * Component for showing one or more values for a Membership view.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object} config  ImageGallery configuration object.
 * @example
 * {
 *    "component": "Relationships",
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
        "metadata": {},
        "download": true
      }
    }
 */
const ImageGallery: React.FC<Props> = (props) => {
  const {data, config} = props;
  const uris = getValByConfig(data, config?.images?.url);
  const singleImage = uris && uris?.length === 1;
  const carouselContainerStyle = config?.style ? config.style : {}
  const getItems = () => {
    const carouselItems = uris?.map((item, index) => {
      return (
        <Carousel.Item key={index}>
          <div>
            <img
              className="d-block w-100"
              src={item}
              alt="First slide"
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
    </div>)
}

export default ImageGallery