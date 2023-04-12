var contentArray;
var options;

// Demonstrates an example of adding objects to the content array after the mapping step's "main"
// function is run. Note that this will affect the counts of total, successful, and failed items.
const additionalContent = [];

contentArray.forEach(content => {
  let episodeDoc = content.value.toObject ? content.value.toObject() : content.value;
  let episodeEntity = episodeDoc.envelope.instance['Episode'];
  const episodeEndDate = episodeEntity.end
  
  //check episodeEndDate and generate alert ONLY if EndDate is NULL
  if(episodeEndDate != null || episodeEndDate == "") 
  { 
    xdmp.log("If condition episodeEndDate != null is true so exit; " + episodeEndDate) 
    return
  }

  const episodeId = episodeEntity.id
  const episodeLat = episodeEntity.lat
  const episodeLon = episodeEntity.lon
  const episodePoint = cts.point(episodeLat, episodeLon)
  var offenderDocs = cts.search(cts.jsonPropertyPairGeospatialQuery('Offender', "lat", "lon", cts.circle(1, episodePoint)))
  
  offenderDocs.toArray().forEach(offenderDoc => {

    let offenderEntity = offenderDoc.toObject().envelope.instance['Offender'];

    const offenderId = offenderEntity.id
    const offenderLat = offenderEntity.lat
    const offenderLon = offenderEntity.lon
    const offenderPoint = cts.point(offenderLat, offenderLon)
    const distance = geo.distance(offenderPoint, episodePoint)

    const newDoc = {
      offenderId: offenderId,
      episodeId: episodeId,
      distance: distance
    }

    additionalContent.push({
      uri: `/proximityAlert/offender/${offenderId}/episode/${episodeId}.json`,
      value: newDoc,
      context: {
        collections: ["proximityAlert"]
      }
    });
  });

});

contentArray.push(...additionalContent);