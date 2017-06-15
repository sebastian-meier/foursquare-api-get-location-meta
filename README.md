# foursquare-api-get-location-meta
Retrieve metadata for a batch of location IDs from Foursquare, using the Foursquare API

## Usage

1. Format your location data into a CSV. The first row should contain the column names. Duplicates are detected by the script.
2. Register an application with the foursquare API, so can get a clientID, clientSecret and set the redirect URL. (I personally had some problem redirecting to localhost, but other report that this should work in general.)
3. Open index.js and enter your foursquare credentials in line 6,7 and 8.

Now we are all set and can launch the system.

```
node index.js PATH_TO_LOCATIONS/CSV.csv OUTPUTPATH/results.json ID_COLUMN
```

**ID_COLUMN** (string): name of the column in the CSV that contains the IDs

When successfully launched you need to go to:

YOURDOMAIN/HOST/WHATEVER:10069/login

(You can switch the port number in the code.)

Afterwards an authentication process should be initiated, which should when successful, lead you to a page that says: NICE. Then you just need to wait.

Have in mind, that foursquare only allows 500 queries per hour. But don't worry the script detects when the limit is reached and waits until the limit is restored, this just means you have to wait a little longer. 😴

## Output

The output is a json object, for each location id there is an array of category objects.

## Getting other meta data

This script is optimised to extract categories. This can be changed easily to what ever metadata you need (e.g. opening times).
Simply go to line 78 in the script and change to your needs:

```
location_keys[locations[venue_count]] = data.venue.categories
```

data.venue holds a standard foursquare venue object.

## ToDos

Right now there will be multiple category objects of one category in the object, which is obviously a waste of bits and bytes. This should be changed to a list of categories and a many to many list of connections.