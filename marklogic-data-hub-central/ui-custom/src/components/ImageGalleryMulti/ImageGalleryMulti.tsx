import React from 'react';
import {getValByConfig} from '../../util/util';
import "./ImageGalleryMulti.scss";

import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {ChevronLeft, ChevronRight} from 'react-bootstrap-icons';


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
        "metadata": {},
        "download": true
      }
    }
 */
const ImageGalleryMulti: React.FC<Props> = (props) => {
  const {data, config} = props;
  const uris = getValByConfig(data, config?.images?.url);
  const imageStyle = config?.style ? config.style : {}
  const getItems = () => {
    const carouselItems = uris?.map((item, index) => {
      return (
        <div key={index} style={imageStyle} data-testid={`item-${index}`}>
          <img
            className="d-block w-100"
            src={item}
            alt="First slide"
          />
        </div>
      )
    });
    return carouselItems ? carouselItems : []
  }

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
    </div>)
}

export default ImageGalleryMulti