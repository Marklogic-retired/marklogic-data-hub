var contentArray;
var options;

// Demonstrates an example of adding objects to the content array after the mapping step's "main"
// function is run. Note that this will affect the counts of total, successful, and failed items.
const additionalContent = [];

contentArray.forEach(content => {
  let offenderDoc = content.value.toObject ? content.value.toObject() : content.value;
  let offenderEntity = offenderDoc.envelope.instance['Offender'];

  const offenderId = offenderEntity.id
  const offenderLat = offenderEntity.lat
  const offenderLon = offenderEntity.lon
  const offenderPoint = cts.point(offenderLat, offenderLon)
 
  var episodeDocs = cts.search(
    cts.andQuery(
      [
        cts.collectionQuery("Episode"),
        cts.jsonPropertyPairGeospatialQuery('Episode', "lat", "lon", cts.circle(1, offenderPoint)),
        cts.notQuery(
          cts.jsonPropertyScopeQuery("end", cts.trueQuery())
        )
      ]
    )
  )

  episodeDocs.toArray().forEach(episodeDoc => {
    let episodeEntity = episodeDoc.toObject().envelope.instance['Episode'];

    const episodeId = episodeEntity.id
    const episodeLat = episodeEntity.lat
    const episodeLon = episodeEntity.lon
    const episodePoint = cts.point(episodeLat, episodeLon)
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

    xdmp.log("Offender (" + offenderId + ") is " + distance + " miles from Episode (" + episodeId + ").")
  });

});

contentArray.push(...additionalContent);