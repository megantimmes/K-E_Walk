export const STOPS = [
  { id: 1,  name: "Inwood Hill Park",                    category: "park",        lat: 40.8677, lng: -73.9218, optional: false, description: "Ancient forest at Manhattan's northern tip with caves once used by Lenape people. Good spot to stretch before the walk begins." },
  { id: 2,  name: "Met Cloisters",                       category: "landmark",    lat: 40.8648, lng: -73.9317, optional: false, description: "Medieval art museum perched above Fort Tryon Park. Pay-what-you-wish with a NYC address." },
  { id: 3,  name: "Fort Tryon Park",                     category: "park",        lat: 40.8607, lng: -73.9330, optional: false, description: "Sweeping Hudson River views and well-maintained paths through Washington Heights." },
  { id: 4,  name: "High Bridge Park",                    category: "landmark",    lat: 40.8483, lng: -73.9330, optional: true,  description: "Home to the oldest standing bridge in NYC with good views of the Harlem River and the Bronx." },
  { id: 5,  name: "Morris-Jumel Mansion",                category: "landmark",    lat: 40.8358, lng: -73.9393, optional: false, description: "Manhattan's oldest surviving house, used as Washington's headquarters in 1776. Note: closed for interior visits." },
  { id: 6,  name: "Sylvan Terrace",                      category: "landmark",    lat: 40.8354, lng: -73.9398, optional: false, description: "A tucked-away cobblestone block of 1880s wooden townhouses — one of Manhattan's best-kept secrets." },
  { id: 7,  name: "Harlem Biscuit Company",              category: "food",        lat: 40.8196, lng: -73.9493, optional: true,  description: "Southern-style biscuit sandwiches — good handheld lunch option in Harlem." },
  { id: 8,  name: "Hamilton Grange",                     category: "landmark",    lat: 40.8196, lng: -73.9499, optional: true,  description: "Alexander Hamilton's Federal-style home, relocated to St. Nicholas Park. Free admission." },
  { id: 9,  name: "Apollo Theater",                      category: "landmark",    lat: 40.8100, lng: -73.9496, optional: false, description: "Legendary Harlem music venue on 125th Street. Photo stop at the marquee." },
  { id: 10, name: "Monkey Cup Coffee",                   category: "coffee",      lat: 40.8095, lng: -73.9501, optional: false, description: "Coffee stop in Harlem, recommended near the Apollo." },
  { id: 11, name: "Central Park — Conservatory Garden",  category: "park",        lat: 40.7930, lng: -73.9519, optional: false, description: "Formal garden at the 105th Street entrance — quieter and more beautiful than the main park paths." },
  { id: 12, name: "Lexington Candy Shop",                category: "food",        lat: 40.7756, lng: -73.9564, optional: true,  description: "Classic NYC luncheonette on the Upper East Side, famous for egg creams and cola floats. Expect a line." },
  { id: 13, name: "The Met Steps",                       category: "sightseeing", lat: 40.7794, lng: -73.9632, optional: true,  description: "Iconic steps of the Metropolitan Museum of Art — great photo stop." },
  { id: 14, name: "Midtown — Radio City Music Hall",     category: "landmark",    lat: 40.7600, lng: -73.9800, optional: false, description: "Art Deco landmark on 6th Avenue. Walk by the facade — no need to go in." },
  { id: 15, name: "Times Square",                        category: "sightseeing", lat: 40.7580, lng: -73.9855, optional: false, description: "Unavoidable but worth a quick pass through. Keep moving." },
  { id: 16, name: "Madison Square Park",                 category: "park",        lat: 40.7424, lng: -73.9878, optional: false, description: "Pleasant park at the Flatiron's base. Home of the original Shake Shack." },
  { id: 17, name: "Flatiron Building",                   category: "landmark",    lat: 40.7411, lng: -73.9897, optional: false, description: "Iconic 1902 triangular skyscraper at the intersection of Broadway and 5th." },
  { id: 18, name: "Quality Bistro — Butter Service",    category: "food",        lat: 40.7460, lng: -73.9877, optional: true,  description: "Stop for the famous butter service if budget allows." },
  { id: 19, name: "Washington Square Park",              category: "park",        lat: 40.7308, lng: -73.9973, optional: false, description: "Greenwich Village's living room — arch, fountain, chess players, street musicians." },
  { id: 20, name: "Little Island",                       category: "park",        lat: 40.7390, lng: -74.0089, optional: true,  description: "Quirky elevated park on the Hudson River, built on old pier pilings." },
  { id: 21, name: "Chelsea Market",                      category: "food",        lat: 40.7424, lng: -74.0045, optional: true,  description: "Food hall in a converted Nabisco factory — good for a snack or crepe." },
  { id: 22, name: "Mojo East Sushi — Omakase",          category: "food",        lat: 40.7230, lng: -73.9980, optional: false, description: "6pm omakase reservation. Do not miss this. Build the day's pacing around arriving on time." },
  { id: 23, name: "Zuccotti Park",                       category: "park",        lat: 40.7074, lng: -74.0113, optional: false, description: "Small plaza in the Financial District, historically notable." },
  { id: 24, name: "Charging Bull",                       category: "sightseeing", lat: 40.7056, lng: -74.0134, optional: false, description: "Wall Street's famous bronze bull — mandatory tourist photo." },
  { id: 25, name: "Battery Park",                        category: "park",        lat: 40.7033, lng: -74.0170, optional: false, description: "Southern tip of Manhattan with harbor views and the Seaglass Carousel. Walk complete." },
];

export const OMAKASE_STOP_ID = 22;

export const CATEGORY_COLORS = {
  park:        { bg: '#DCFCE7', text: '#15803D', label: 'Park' },
  landmark:    { bg: '#DBEAFE', text: '#1D4ED8', label: 'Landmark' },
  food:        { bg: '#FEF3C7', text: '#B45309', label: 'Food' },
  coffee:      { bg: '#F5F0E8', text: '#92400E', label: 'Coffee' },
  sightseeing: { bg: '#F3E8FF', text: '#7C3AED', label: 'Sightseeing' },
};
