export var getRandomLocation = function (latitude, longitude, radiusInMeters) {

  var getRandomCoordinates = function (radius, uniform) {
      // Generate two random numbers
      var a = Math.random(),
          b = Math.random();

      // Flip for more uniformity.
      if (uniform) {
          if (b < a) {
              var c = b;
              b = a;
              a = c;
          }
      }

      // It's all triangles.
      return [
          b * radius * Math.cos(2 * Math.PI * a / b),
          b * radius * Math.sin(2 * Math.PI * a / b)
      ];
  };

  var randomCoordinates = getRandomCoordinates(radiusInMeters, true);

  // Earths radius in meters via WGS 84 model.
  var earth = 6378137;

  // Offsets in meters.
  var northOffset = randomCoordinates[0],
      eastOffset = randomCoordinates[1];

  // Offset coordinates in radians.
  var offsetLatitude = northOffset / earth,
      offsetLongitude = eastOffset / (earth * Math.cos(Math.PI * (latitude / 180)));

  // Offset position in decimal degrees.
  return {
      latitude: latitude + (offsetLatitude * (180 / Math.PI)),
      longitude: longitude + (offsetLongitude * (180 / Math.PI))
  }
};

export function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
export const getPositionOptions = {
  enableHighAccuracy: false,
  timeout: 4000,
  maximumAge: 0
};
function getUserCurrentLocationByHTML(onRetrievedPosition, onFailedGettingUserLocation, onNotAgreedSharing, pushAlertPopUp){
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // pushAlertPopUp('Able to get location using HTML', JSON.stringify(pos));
      // console.log('Able to get location using HTML', JSON.stringify(pos));
      onRetrievedPosition(pos);
      
    }, function(res) {
      // Handle here if get current location error has occurred
      pushAlertPopUp('Please enable GPS service');
      onFailedGettingUserLocation();
    },getPositionOptions);
  } else {
    pushAlertPopUp(`Problem retrieving location, please try again`);
    // Handle here if user not agreed to share current location
    // onNotAgreedSharing();
  }
}

export function getUserCurrentLocation(onRetrievedPosition = (pos) => {}, onFailedGettingUserLocation = () => {}, onNotAgreedSharing = () => {}, pushAlertPopUp) {
    try{
      // eslint-disable-next-line no-undef
      my.getLocation({
        success: (res) => {
          const pos = {
            lat: parseFloat(res.latitude),
            lng: parseFloat(res.longitude)
          };
          
          onRetrievedPosition(pos);
        },
        fail(res) {
          switch (res.error) {
            case "11":
              pushAlertPopUp('Please enable GPS service');
              break;
            case "12":
              pushAlertPopUp('Problem connecting network, please try again');
              break;
            case "13":
              pushAlertPopUp('Problem retrieving location. Please try again later');
              break;
            case "14":
              pushAlertPopUp('Problem retrieving location. Please try again later');
              break;
            default:
              // usually error is "location timeout", but sometimes event GPS turn on will enter here
              // pushAlertPopUp('Something went wrong, please enable GPS service');
              break;
          }
          getUserCurrentLocationByHTML(onRetrievedPosition, onFailedGettingUserLocation, onNotAgreedSharing, pushAlertPopUp);
        },
      });
      return ;
    }catch(err){
      // console.error('tng SDK not available');
      getUserCurrentLocationByHTML(onRetrievedPosition, onFailedGettingUserLocation, onNotAgreedSharing, pushAlertPopUp);
    }
}
  