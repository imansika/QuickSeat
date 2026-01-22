import { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Clock, MapPin, Bus as BusIcon, Navigation } from 'lucide-react';

interface BusRoute {
  _id: string;
  busNumber: string;
  routeNumber: string;
  origin: string;
  destination: string;
  seatCapacity: number;
  departureTime: string;
  arrivalTime: string;
  operatingDays: string;
  ratePerKm: number;
}

interface BusRouteMapProps {
  origin: string;
  destination: string;
  buses: BusRoute[];
  onClose: () => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '1rem'
};

const defaultCenter = {
  lat: 7.8731,
  lng: 80.7718
};

export function BusRouteMap({ origin, destination, buses, onClose }: BusRouteMapProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [selectedBus, setSelectedBus] = useState<BusRoute | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (window.google && origin && destination) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: origin + ', Sri Lanka',
          destination: destination + ', Sri Lanka',
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const route = result.routes[0];
            if (route && route.legs[0]) {
              setDistance(route.legs[0].distance?.text || '');
              setDuration(route.legs[0].duration?.text || '');
            }
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    }
  }, [origin, destination]);

  const calculatePrice = (distanceKm: number, ratePerKm: number) => {
    return Math.round(distanceKm * ratePerKm);
  };

  const getDistanceInKm = () => {
    if (!distance) return 0;
    return parseFloat(distance.replace(/[^\d.]/g, ''));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] px-8 py-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Available Bus Routes</h2>
              <div className="flex items-center gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">{origin}</span>
                </div>
                <span>→</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">{destination}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Route Info */}
          {distance && duration && (
            <div className="flex items-center gap-8 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="flex items-center gap-3">
                <Navigation className="w-6 h-6 text-yellow-300" />
                <div>
                  <p className="text-sm text-blue-100">Distance</p>
                  <p className="text-xl font-bold">{distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-green-300" />
                <div>
                  <p className="text-sm text-blue-100">Est. Duration</p>
                  <p className="text-xl font-bold">{duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BusIcon className="w-6 h-6 text-purple-300" />
                <div>
                  <p className="text-sm text-blue-100">Available Buses</p>
                  <p className="text-xl font-bold">{buses.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6 p-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <LoadScript googleMapsApiKey={apiKey}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={8}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </LoadScript>
          </div>

          {/* Bus List Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Select a Bus</h3>
            {buses.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl">
                <BusIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No buses available</p>
                <p className="text-sm text-slate-500 mt-2">Try a different route</p>
              </div>
            ) : (
              buses.map((bus) => {
                const distanceKm = getDistanceInKm();
                const price = calculatePrice(distanceKm, bus.ratePerKm);
                const isSelected = selectedBus?._id === bus._id;

                return (
                  <div
                    key={bus._id}
                    onClick={() => setSelectedBus(bus)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#264b8d] bg-blue-50 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-[#264b8d] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-slate-900">{bus.busNumber}</h4>
                        <p className="text-sm text-[#264b8d] font-semibold">Route {bus.routeNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#264b8d]">Rs. {price}</p>
                        <p className="text-xs text-slate-500">@ Rs. {bus.ratePerKm}/km</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Departure</span>
                        <span className="font-semibold text-slate-900">{bus.departureTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Arrival</span>
                        <span className="font-semibold text-slate-900">{bus.arrivalTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Seats</span>
                        <span className="font-semibold text-slate-900">{bus.seatCapacity} available</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Operating</span>
                        <span className="font-semibold text-slate-900 capitalize">{bus.operatingDays}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <button className="w-full mt-4 bg-[#264b8d] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1e3a6d] transition-colors">
                        Book This Bus
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
