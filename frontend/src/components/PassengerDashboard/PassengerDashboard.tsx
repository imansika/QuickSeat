import { useState, useEffect } from "react";
import {
  Bus as BusIcon,
  MapPin,
  Calendar,
  Clock,
  Search,
  LogOut,
  User,
  History,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Settings,
  Ticket as TicketIcon,
  Zap,
  DollarSign,
  Wifi,
  Snowflake,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  GoogleMap,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { searchBuses } from "../../services/bus.service";
import type { Bus } from "../../types/bus";
import { SeatSelectionModal } from "../SeatSelection/SeatSelectionModal";

export interface SearchData {
  origin: string;
  destination: string;
  date: string;
  time: string;
}

interface PassengerDashboardProps {
  onSearch: (data: SearchData) => void;
  onLogout: () => void;
  onViewProfile: () => void;
  onViewBookings: () => void;
}

export function PassengerDashboard({
  onSearch,
  onLogout,
  onViewProfile,
  onViewBookings,
}: PassengerDashboardProps) {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [searchData, setSearchData] = useState<SearchData>({
    origin: "",
    destination: "",
    date: "",
    time: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [availableBuses, setAvailableBuses] = useState<Bus[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<"recommended" | "price" | "duration">(
    "recommended",
  );
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchData.origin && searchData.destination) {
      setIsSearching(true);
      try {
        const response = await searchBuses({
          origin: searchData.origin,
          destination: searchData.destination,
          date: searchData.date,
        });
        setAvailableBuses(response.data || []);
        setHasSearched(true);
      } catch (error) {
        console.error("Search error:", error);
        alert("Failed to search buses. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Calculate route when buses are loaded or when a specific bus is selected
  useEffect(() => {
    if (
      availableBuses.length > 0 &&
      searchData.origin &&
      searchData.destination &&
      isLoaded
    ) {
      // If a specific bus is selected, calculate route for that bus
      // Otherwise, show the first bus route
      const busToDisplay = selectedBus || availableBuses[0];
      
      if (!busToDisplay) return;

      const directionsService = new google.maps.DirectionsService();
      
      // Get the bus index to determine which route variant to use
      const busIndex = availableBuses.findIndex(b => b._id === busToDisplay._id);
      
      // Get waypoints from the bus stops stored in MongoDB
      const waypoints: google.maps.DirectionsWaypoint[] = busToDisplay.stops
        ? busToDisplay.stops.map((stop: any) => ({
            location: stop.location + ", Sri Lanka",
            stopover: true,
          }))
        : [];
      
      directionsService.route(
        {
          origin: searchData.origin + ", Sri Lanka",
          destination: searchData.destination + ", Sri Lanka",
          waypoints: waypoints, // Use predefined waypoints for public bus routes
          travelMode: google.maps.TravelMode.DRIVING,
          // Request alternative routes only if no waypoints are defined
          provideRouteAlternatives: waypoints.length === 0,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            // Use different route alternatives for different buses only if no waypoints
            const selectedRouteIndex = waypoints.length === 0 && result.routes.length > 1
              ? busIndex % result.routes.length 
              : 0;
            
            setDirections(result);
            setRouteIndex(selectedRouteIndex);
            
            // Get distance and duration from the selected route
            const route = result.routes[selectedRouteIndex];
            if (route && route.legs[0]) {
              // Sum up all legs if there are waypoints
              let totalDistance = 0;
              let totalDuration = 0;
              route.legs.forEach(leg => {
                totalDistance += leg.distance?.value || 0;
                totalDuration += leg.duration?.value || 0;
              });
              
              // Convert to readable format
              const distanceKm = (totalDistance / 1000).toFixed(1);
              const durationHours = Math.floor(totalDuration / 3600);
              const durationMins = Math.floor((totalDuration % 3600) / 60);
              
              setDistance(`${distanceKm} km`);
              setDuration(
                durationHours > 0 
                  ? `${durationHours} hour${durationHours > 1 ? 's' : ''} ${durationMins} mins`
                  : `${durationMins} mins`
              );
            }
          }
        },
      );
    }
  }, [availableBuses, searchData.origin, searchData.destination, isLoaded, selectedBus]);

  const getDistanceInKm = (): number => {
    if (!distance) return 0;
    const match = distance.match(/([\d,]+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
    }
    return 0;
  };

  const calculatePrice = (distanceKm: number, ratePerKm: number): number => {
    return Math.round(distanceKm * ratePerKm);
  };

  const calculateArrivalTime = (
    departureTime: string,
    durationStr: string,
  ): string => {
    if (!durationStr) return "N/A";

    // Parse departure time (format: "08:00")
    const [depHour, depMin] = departureTime.split(":").map(Number);

    // Parse duration string (format: "2 hours 30 mins" or "45 mins" or "1 hour")
    let totalMinutes = 0;
    const hoursMatch = durationStr.match(/(\d+)\s*hour/);
    const minsMatch = durationStr.match(/(\d+)\s*min/);

    if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
    if (minsMatch) totalMinutes += parseInt(minsMatch[1]);

    // Calculate arrival time
    let arrivalMinutes = depHour * 60 + depMin + totalMinutes;
    const arrivalHour = Math.floor(arrivalMinutes / 60) % 24;
    const arrivalMin = arrivalMinutes % 60;

    // Format as HH:MM
    return `${String(arrivalHour).padStart(2, "0")}:${String(arrivalMin).padStart(2, "0")}`;
  };

  // Helper function to get available seats (mock data - in production would come from backend)
  const getAvailableSeats = (busId: string, totalCapacity: number): number => {
    // Mock booked seats count - in production this would come from the backend
    const bookedSeatsCount = Math.floor(Math.random() * (totalCapacity * 0.4)); // 0-40% booked
    return totalCapacity - bookedSeatsCount;
  };

  const sortedBuses = [...availableBuses].sort((a, b) => {
    const distanceKm = getDistanceInKm();
    if (sortBy === "price") {
      const priceA = calculatePrice(distanceKm, a.ratePerKm);
      const priceB = calculatePrice(distanceKm, b.ratePerKm);
      return priceA - priceB;
    }
    if (sortBy === "duration") {
      const durationA = parseInt(a.departureTime.replace(":", ""));
      const durationB = parseInt(b.departureTime.replace(":", ""));
      return durationA - durationB;
    }
    // Recommended: Earliest departure (fastest)
    const durationA = parseInt(a.departureTime.replace(":", ""));
    const durationB = parseInt(b.departureTime.replace(":", ""));
    return durationA - durationB;
  });

  const mapContainerStyle = {
    width: "100%",
    height: "600px",
    borderRadius: "16px",
  };

  const center = {
    lat: 7.8731,
    lng: 80.7718,
  };

  const recentSearches = [
    { from: "Colombo", to: "Trincomalee", date: "Jan 15, 2026" },
    { from: "Negombo", to: "Anuradhapura", date: "Jan 10, 2026" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-[#264b8d] p-2.5 rounded-xl group-hover:shadow-lg transition-shadow">
                <BusIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#264b8d]">
                QuickSeat
              </span>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-colors"
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#264b8d]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-slate-900 text-sm">
                    {userProfile?.fullName || currentUser?.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-slate-600">Passenger</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/my-bookings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <TicketIcon className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">My Bookings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onViewProfile();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">Settings</span>
                  </button>
                  <div className="border-t border-slate-200 my-2"></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80"
            alt="Bus travel background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
              Find Your Perfect Bus
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-medium">
              Search, compare, and book your journey with ease
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-700 mb-3">
                  <MapPin className="w-5 h-5 inline mr-2" />
                  From
                </label>
                <input
                  type="text"
                  value={searchData.origin}
                  onChange={(e) =>
                    setSearchData({ ...searchData, origin: e.target.value })
                  }
                  onFocus={() => setFocusedField("origin")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter origin city"
                  className={`w-full px-6 py-5 rounded-xl border-2 transition-all duration-300 text-lg ${
                    focusedField === "origin"
                      ? "border-[#264b8d] ring-4 ring-[#264b8d]/10 shadow-lg"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-700 mb-3">
                  <MapPin className="w-5 h-5 inline mr-2" />
                  To
                </label>
                <input
                  type="text"
                  value={searchData.destination}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      destination: e.target.value,
                    })
                  }
                  onFocus={() => setFocusedField("destination")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter destination city"
                  className={`w-full px-6 py-5 rounded-xl border-2 transition-all duration-300 text-lg ${
                    focusedField === "destination"
                      ? "border-[#264b8d] ring-4 ring-[#264b8d]/10 shadow-lg"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-700 mb-3">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) =>
                    setSearchData({ ...searchData, date: e.target.value })
                  }
                  onFocus={() => setFocusedField("date")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-6 py-5 rounded-xl border-2 transition-all duration-300 text-lg ${
                    focusedField === "date"
                      ? "border-[#264b8d] ring-4 ring-[#264b8d]/10 shadow-lg"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-base font-semibold text-slate-700 mb-3">
                  <Clock className="w-5 h-5 inline mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  value={searchData.time}
                  onChange={(e) =>
                    setSearchData({ ...searchData, time: e.target.value })
                  }
                  onFocus={() => setFocusedField("time")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-6 py-5 rounded-xl border-2 transition-all duration-300 text-lg ${
                    focusedField === "time"
                      ? "border-[#264b8d] ring-4 ring-[#264b8d]/10 shadow-lg"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="group w-full py-5 bg-gradient-to-r from-[#264b8d] via-[#1e3a6d] to-[#264b8d] text-white rounded-xl font-semibold text-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSearching ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Search Buses
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Search Results with Map - Replaces Popular Routes */}
      {hasSearched && (
        <div className="w-full py-12 bg-gradient-to-b from-transparent via-blue-50/40 to-transparent">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <h3 className="font-semibold mb-4">Sort By</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSortBy("recommended")}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                        sortBy === "recommended"
                          ? "bg-blue-50 text-blue-600 border-2 border-blue-600"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <TrendingUp className="w-5 h-5" />
                      Recommended
                    </button>
                    <button
                      onClick={() => setSortBy("price")}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                        sortBy === "price"
                          ? "bg-blue-50 text-blue-600 border-2 border-blue-600"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                      Lowest Price
                    </button>
                    <button
                      onClick={() => setSortBy("duration")}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                        sortBy === "duration"
                          ? "bg-blue-50 text-blue-600 border-2 border-blue-600"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Zap className="w-5 h-5" />
                      Fastest
                    </button>
                  </div>

                  {sortBy === "recommended" && sortedBuses.length > 0 && (
                    <div className="mt-6 p-4 bg-[#dfae6b]/10 border border-[#dfae6b]/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-[#dfae6b] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#c99650] text-sm">
                            Fastest Route
                          </p>
                          <p className="text-xs text-[#b8883d] mt-1">
                            {duration
                              ? `Journey time: ${duration}`
                              : "Earliest departure"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Routes List */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Buses ({sortedBuses.length})
                  </h2>
                </div>
                
                {sortedBuses.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Click on any bus card to view its route on the map
                    </p>
                  </div>
                )}

                {sortedBuses.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <BusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No buses found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  sortedBuses.map((bus, index) => {
                    const distanceKm = getDistanceInKm();
                    const price = calculatePrice(distanceKm, bus.ratePerKm);
                    const isRecommended =
                      sortBy === "recommended" && index === 0;
                    const availableSeats = getAvailableSeats(bus._id, bus.seatCapacity);

                    return (
                      <div
                        key={bus._id}
                        onClick={() => setSelectedBus(bus)}
                        className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 cursor-pointer border-2 ${
                          selectedBus?._id === bus._id
                            ? "border-[#264b8d] ring-2 ring-[#264b8d]/20"
                            : isRecommended
                              ? "border-[#dfae6b]"
                              : "border-transparent hover:border-blue-200"
                        }`}
                      >
                        {isRecommended && (
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#dfae6b]/20">
                            <Zap className="w-5 h-5 text-[#dfae6b] fill-[#dfae6b]" />
                            <span className="text-sm font-semibold text-[#dfae6b]">
                              FASTEST ROUTE
                            </span>
                          </div>
                        )}
                        
                        {selectedBus?._id === bus._id && (
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#264b8d]/20">
                            <MapPin className="w-5 h-5 text-[#264b8d]" />
                            <span className="text-sm font-semibold text-[#264b8d]">
                              SHOWING ON MAP
                            </span>
                          </div>
                        )}

                        <div className="space-y-4">
                          {/* Bus Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-[#264b8d]/10 rounded-lg flex items-center justify-center">
                                <BusIcon className="w-6 h-6 text-[#264b8d]" />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-gray-900">
                                  {bus.busNumber}
                                </p>
                                <p className="text-sm text-blue-600">
                                  {bus.routeNumber}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#264b8d]">
                                Rs. {price}
                              </p>
                              <p className="text-xs text-gray-600">per seat</p>
                            </div>
                          </div>

                          {/* Time Info */}
                          <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
                            <div>
                              <p className="text-xl font-bold text-gray-900">
                                {bus.departureTime}
                              </p>
                              <p className="text-sm text-gray-600">
                                {searchData.origin}
                              </p>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="relative">
                                <div className="border-t-2 border-gray-300 border-dashed"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                  <p className="text-xs text-gray-600 whitespace-nowrap">
                                    {duration || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">
                                {calculateArrivalTime(
                                  bus.departureTime,
                                  duration || "",
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {searchData.destination}
                              </p>
                            </div>
                          </div>

                          {/* Amenities & Seats */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                <Wifi className="w-4 h-4" />
                                WiFi
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                                <Snowflake className="w-4 h-4" />
                                AC
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${
                                  availableSeats > 10 
                                    ? 'text-green-600' 
                                    : availableSeats > 5 
                                    ? 'text-orange-600' 
                                    : 'text-red-600'
                                }`}>
                                  {availableSeats} available
                                </span>
                                <span className="text-xs text-gray-500">
                                  / {bus.seatCapacity} seats
                                </span>
                              </div>
                            </div>
                          </div>

                          {selectedBus?._id === bus._id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsSeatModalOpen(true);
                              }}
                              className="w-full mt-4 px-6 py-3 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d] transition-all"
                            >
                              Book This Bus
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Map */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {searchData.origin} → {searchData.destination}
                    </h3>
                    {selectedBus && (
                      <div className="mb-3 p-3 bg-[#264b8d]/10 rounded-lg">
                        <p className="text-sm font-semibold text-[#264b8d]">
                          Showing route: {selectedBus.routeNumber} - {selectedBus.busNumber}
                        </p>
                      </div>
                    )}
                    {distance && duration && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📍 {distance}</span>
                        <span>⏱️ {duration}</span>
                        {sortedBuses.length > 0 && (
                          <span>🚌 {sortedBuses.length} buses</span>
                        )}
                      </div>
                    )}
                  </div>
                  {isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={center}
                      zoom={8}
                      options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                      }}
                    >
                      {directions && (
                        <DirectionsRenderer
                          directions={
                            directions as google.maps.DirectionsResult
                          }
                          options={{
                            routeIndex: routeIndex,
                          }}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
                      <p className="text-gray-500">Loading map...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {!hasSearched && recentSearches.length > 0 && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
            Recent Searches
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() =>
                  setSearchData({
                    ...searchData,
                    origin: search.from,
                    destination: search.to,
                  })
                }
                className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-slate-100 hover:border-[#264b8d] group hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] rounded-xl shadow-md">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">
                      {search.from} → {search.to}
                    </p>
                    <p className="text-sm text-slate-600">{search.date}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#264b8d] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#264b8d] p-2 rounded-xl">
                  <BusIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">QuickSeat</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Making bus travel simple, comfortable and accessible for
                everyone.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li>support@quickseat.com</li>
                <li>1-800-QUICKSEAT</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400">
                © 2026 QuickSeat. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Seat Selection Modal */}
      {selectedBus && (
        <SeatSelectionModal
          bus={selectedBus}
          searchData={searchData}
          price={calculatePrice(getDistanceInKm(), selectedBus.ratePerKm)}
          duration={duration}
          isOpen={isSeatModalOpen}
          onClose={() => setIsSeatModalOpen(false)}
        />
      )}
    </div>
  );
}
