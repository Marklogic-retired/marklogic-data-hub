import React, { useState } from "react";
import { Map, Marker } from 'pigeon-maps'

const GeoMap = (props) => {

    const [center, setCenter] = useState([50.879, 4.6997])
    const [zoom, setZoom] = useState(11)
    const [hue, setHue] = useState(0)
    const color = `#5d6aaa`

    return (
        <Map 
            height={300}
            center={center} 
            zoom={zoom} 
            onBoundsChanged={({ center, zoom }) => { 
                setCenter(center) 
                setZoom(zoom) 
            }} 
        >
            <Marker 
                width={40}
                anchor={[50.879, 4.6997]} 
                color={color} 
                onClick={() => setHue(hue + 20)} 
            />
      </Map>
    );
};

export default GeoMap;
