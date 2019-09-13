import React, { Component } from 'react'
import XMLViewer from 'react-xml-viewer'
 
const xml = `
<envelope xmlns="http://marklogic.com/entity-services">
  <headers/>
  <triples/>
  <instance>
    <info>
      <title>XML_Entity</title>
      <version>0.0.1</version>
    </info>
    <XML_Entity><id>0</id><first-name>Bill</first-name><last-name>Hopkins</last-name><balance>$2,511.70</balance><city>Vaughn</city><company>MITROC</company><email>dorthyblackburn@mitroc.com</email><phone>+1 (988) 597-3702</phone></XML_Entity>
  </instance>
  <attachments><envelope>
      <headers><sources xmlns=""><name>xml-FLow</name></sources><createdOn xmlns="">2019-09-13T10:25:25.9564564-07:00</createdOn><createdBy xmlns="">admin</createdBy></headers>
      <triples/>
      <instance>
	<age xmlns="">35</age>
	<balance xmlns="">$2,511.70</balance>
	<city xmlns="">Vaughn</city>
	<company xmlns="">MITROC</company>
	<email xmlns="">dorthyblackburn@mitroc.com</email>
	<eyeColor xmlns="">brown</eyeColor>
	<favoriteFruit xmlns="">banana</favoriteFruit>
	<fname xmlns="">Bill</fname>
	<gender xmlns="">male</gender>
	<id xmlns="">0</id>
	<isActive xmlns="">false</isActive>
	<lname xmlns="">Hopkins</lname>
	<phone xmlns="">+1 (988) 597-3702</phone>
	<registered xmlns="">2014-10-29T06:15:24 +07:00</registered>
	<state xmlns="">Utah</state>
	<street xmlns="">577 Ditmas Avenue</street>
	<synonym xmlns="">big</synonym>
	<zip xmlns="">90644</zip>
      </instance>
      <attachments/>
    </envelope></attachments>
</envelope>
`
 

const XmlView = (props) => {

    return (
        <div>
        <XMLViewer xml={xml} />
        </div>
    );
}

export default XmlView;
