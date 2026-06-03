import { useEffect, useState } from 'react';
import { AlertCircle, Bus, Calendar, ChevronDown, Clock, LogOut, Settings, Ticket as TicketIcon, Trash2, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyPastBookings, getMyUpcomingBookings } from '../../services/booking.service';
import { searchAvailableBuses } from '../../services/bus.service';
import { SeatSelectionModal } from '../SeatSelection/SeatSelectionModal';
import type { Bus as BusType } from '../../types/bus';

interface Booking {
  _id?: string;
  bookingId: string;
  busNumber: string;
  origin?: string;
  destination?: string;
  time?: string;
  seats: string[];
  journeyDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

const ITEMS_PER_PAGE = 6;
const PAST_TRIP_WINDOW_DAYS = 7;
const HIDDEN_PAST_BOOKINGS_KEY_PREFIX = 'quickseat_hidden_past_bookings';

const getHiddenPastBookingsStorageKey = (userId?: string) =>
  `${HIDDEN_PAST_BOOKINGS_KEY_PREFIX}:${userId ?? 'guest'}`;

const readHiddenPastBookingIds = (userId?: string): string[] => {
  try {
    const raw = localStorage.getItem(getHiddenPastBookingsStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
};

const writeHiddenPastBookingIds = (userId: string | undefined, bookingIds: string[]) => {
  localStorage.setItem(getHiddenPastBookingsStorageKey(userId), JSON.stringify(bookingIds));
};

const formatDate = (dateValue: string) =>
  new Date(dateValue).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const toDateInputValue = (dateValue: Date | string) => {
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  const normalizedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return normalizedDate.toISOString().slice(0, 10);
};

const getMinutesFromTime = (timeValue: string) => {
  const [hours, minutes] = String(timeValue || '').split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const formatDuration = (departureTime: string, arrivalTime: string) => {
  const departureMinutes = getMinutesFromTime(departureTime);
  const arrivalMinutes = getMinutesFromTime(arrivalTime);

  if (departureMinutes === null || arrivalMinutes === null) {
    return 'N/A';
  }

  const totalMinutes = (arrivalMinutes - departureMinutes + 1440) % 1440;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} mins`;
  }

  return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} mins` : ''}`;
};

const isSameDay = (leftValue: string, rightValue: Date) => {
  const left = new Date(leftValue);
  return left.toDateString() === rightValue.toDateString();
};

const isWithinPastTripWindow = (journeyDate: string) => {
  const journey = new Date(journeyDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PAST_TRIP_WINDOW_DAYS);

  return journey >= cutoff && journey <= new Date();
};

export function MyBookings() {
  const navigate = useNavigate();
  const { currentUser, userProfile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRebookDialogOpen, setIsRebookDialogOpen] = useState(false);
  const [isRebookSearching, setIsRebookSearching] = useState(false);
  const [rebookError, setRebookError] = useState('');
  const [rebookDate, setRebookDate] = useState('');
  const [activeRebookBooking, setActiveRebookBooking] = useState<Booking | null>(null);
  const [activeRebookBus, setActiveRebookBus] = useState<BusType | null>(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const [upcomingResponse, pastResponse] = await Promise.all([
          getMyUpcomingBookings(),
          getMyPastBookings(),
        ]);

        if (!isActive) {
          return;
        }

        const hiddenPastBookingIds = readHiddenPastBookingIds(currentUser?.uid);
        const latestPastBookings = ((pastResponse.data ?? []) as Booking[])
          .filter((booking) => !hiddenPastBookingIds.includes(booking.bookingId))
          .filter((booking) => isWithinPastTripWindow(booking.journeyDate))
          .sort((left, right) => {
            const journeyDiff = new Date(right.journeyDate).getTime() - new Date(left.journeyDate).getTime();
            if (journeyDiff !== 0) {
              return journeyDiff;
            }

            const leftCreatedAt = left.createdAt ? new Date(left.createdAt).getTime() : 0;
            const rightCreatedAt = right.createdAt ? new Date(right.createdAt).getTime() : 0;
            return rightCreatedAt - leftCreatedAt;
          })
          .slice(0, 1);

        setUpcomingBookings((upcomingResponse.data ?? []) as Booking[]);
        setPastBookings(latestPastBookings);
        setUpcomingPage(1);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : String(loadError);
        setError(message || 'Failed to load bookings');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      isActive = false;
    };
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const openRebookDialog = (booking: Booking) => {
    const bookingDate = new Date(booking.journeyDate);
    const fallbackDate = bookingDate.getTime() > Date.now() ? bookingDate : new Date();

    setActiveRebookBooking(booking);
    setRebookDate(toDateInputValue(fallbackDate));
    setRebookError('');
    setIsSeatModalOpen(false);
    setIsRebookDialogOpen(true);
  };

  const closeRebookDialog = () => {
    setIsRebookDialogOpen(false);
    setIsRebookSearching(false);
    setRebookError('');
    setRebookDate('');
    setActiveRebookBooking(null);
  };

  const handleConfirmRebook = async () => {
    if (!activeRebookBooking) {
      return;
    }

    if (!rebookDate) {
      setRebookError('Please select a journey date');
      return;
    }

    try {
      setIsRebookSearching(true);
      setRebookError('');

      const response = await searchAvailableBuses({ date: rebookDate });
      const availableBuses = (response.data ?? []) as BusType[];
      const matchedBus = availableBuses.find(
        (bus) => bus.busNumber.toUpperCase() === activeRebookBooking.busNumber.toUpperCase()
      );

      if (!matchedBus) {
        setRebookError('This bus is not available on the selected date. Please choose another date.');
        return;
      }

      setActiveRebookBus(matchedBus);
      setIsRebookDialogOpen(false);
      setIsSeatModalOpen(true);
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : String(searchError);
      setRebookError(message || 'Failed to check bus availability');
    } finally {
      setIsRebookSearching(false);
    }
  };

  const handleDeletePastBooking = (bookingId: string) => {
    const existingHiddenIds = readHiddenPastBookingIds(currentUser?.uid);
    if (!existingHiddenIds.includes(bookingId)) {
      writeHiddenPastBookingIds(currentUser?.uid, [...existingHiddenIds, bookingId]);
    }

    setPastBookings((previousBookings) => previousBookings.filter((booking) => booking.bookingId !== bookingId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getRebookPrice = () => {
    if (!activeRebookBooking || activeRebookBooking.seats.length === 0) {
      return 0;
    }

    return Math.max(
      1,
      Math.round(Math.max(0, activeRebookBooking.totalAmount - 50) / activeRebookBooking.seats.length)
    );
  };

  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingBookings.length / ITEMS_PER_PAGE));

  const paginatedUpcomingBookings = upcomingBookings.slice(
    (upcomingPage - 1) * ITEMS_PER_PAGE,
    upcomingPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (upcomingPage > upcomingTotalPages) {
      setUpcomingPage(upcomingTotalPages);
    }
  }, [upcomingPage, upcomingTotalPages]);

  const BookingCard = ({ booking, isPastTrip = false }: { booking: Booking; isPastTrip?: boolean }) => {
    const isToday = isSameDay(booking.journeyDate, new Date());

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] p-6 text-white">
          <div className="mb-2 flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            <span className="font-mono text-sm font-semibold">{booking.bookingId}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </div>
            {isToday && (
              <div className="inline-block rounded-full border border-green-300 bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Today
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-slate-600" />
                <div>
                  <p className="mb-1 text-xs text-slate-600">Journey Date</p>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(booking.journeyDate)}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-slate-600" />
                <div>
                  <p className="mb-1 text-xs text-slate-600">Booked On</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.createdAt ? formatDate(booking.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <Bus className="mt-0.5 h-4 w-4 text-slate-600" />
                <div>
                  <p className="mb-1 text-xs text-slate-600">Bus Number</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.busNumber}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <TicketIcon className="mt-0.5 h-4 w-4 text-slate-600" />
                <div>
                  <p className="mb-1 text-xs text-slate-600">Seats</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.seats.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">Total Paid</p>
              <p className="text-2xl font-bold text-[#264b8d]">Rs. {booking.totalAmount}</p>
            </div>

            <div className="flex items-center gap-3">
              {booking.status === 'confirmed' && !isToday && (
                <button
                  onClick={() => openRebookDialog(booking)}
                  className="rounded-xl bg-gradient-to-r from-[#dfae6b] to-[#c99a5a] px-4 py-3 font-semibold text-white shadow-md transition-all hover:from-[#c99a5a] hover:to-[#b8894a] hover:shadow-lg"
                >
                  Book Again
                </button>
              )}

              {isPastTrip && (
                <button
                  onClick={() => handleDeletePastBooking(booking.bookingId)}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/passenger')}
                className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-[#264b8d] transition-colors hover:bg-[#264b8d]/5"
              >
                ← Back
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#264b8d] p-2.5">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-slate-50"
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="h-10 w-10 rounded-full border-2 border-[#264b8d] object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#264b8d] to-[#1e3a6d]">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">{userProfile?.fullName || 'Passenger'}</p>
                  <p className="text-xs text-slate-600">Passenger</p>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/passenger');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <User className="h-5 w-5 text-slate-600" />
                    <span className="text-slate-900">View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/passenger');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <Bus className="h-5 w-5 text-slate-600" />
                    <span className="text-slate-900">Search Buses</span>
                  </button>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <Settings className="h-5 w-5 text-slate-600" />
                    <span className="text-slate-900">Settings</span>
                  </button>
                  <div className="my-2 border-t border-slate-200"></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      void handleLogout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full px-6 py-12 lg:px-10">
        <div className="mb-10">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-lg text-slate-600">View your confirmed upcoming and past trips</p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#264b8d]"></div>
            <p className="text-slate-600">Loading your bookings...</p>
          </div>
        )}

        {!loading && error && (
          <div className="mb-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && upcomingBookings.length > 0 && (
          <div className="mb-16">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-2 rounded-full bg-gradient-to-b from-[#264b8d] to-[#1e3a6d]"></div>
              <h2 className="text-3xl font-bold text-slate-900">Upcoming Trips</h2>
              <span className="rounded-full bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] px-4 py-1.5 text-sm font-semibold text-white shadow-md">
                {upcomingBookings.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {paginatedUpcomingBookings.map((booking) => (
                <BookingCard key={booking._id ?? booking.bookingId} booking={booking} />
              ))}
            </div>
            {upcomingTotalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setUpcomingPage((prev) => Math.max(1, prev - 1))}
                  disabled={upcomingPage === 1}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>←</span>
                </button>
                <span className="text-sm font-medium text-blue-700">
                  Page {upcomingPage} of {upcomingTotalPages}
                </span>
                <button
                  onClick={() => setUpcomingPage((prev) => Math.min(upcomingTotalPages, prev + 1))}
                  disabled={upcomingPage === upcomingTotalPages}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && pastBookings.length > 0 && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-2 rounded-full bg-gradient-to-b from-slate-400 to-slate-500"></div>
              <h2 className="text-3xl font-bold text-slate-900">Latest Past Trip</h2>
              <span className="rounded-full bg-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-md">
                {pastBookings.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {pastBookings.map((booking) => (
                <BookingCard key={booking._id ?? booking.bookingId} booking={booking} isPastTrip />
              ))}
            </div>
          </div>
        )}

        {!loading && upcomingBookings.length === 0 && pastBookings.length === 0 && !error && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <TicketIcon className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No Bookings Yet</h3>
            <p className="mb-6 text-slate-600">Start your journey by booking your first ticket</p>
            <button
              onClick={() => navigate('/passenger')}
              className="rounded-xl bg-[#264b8d] px-6 py-3 font-semibold text-white transition-all hover:bg-[#1e3a6d]"
            >
              Book a Ticket
            </button>
          </div>
        )}
      </div>

      {isRebookDialogOpen && activeRebookBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={closeRebookDialog}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 pr-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#264b8d]/10 px-3 py-1 text-sm font-semibold text-[#264b8d]">
                <Calendar className="h-4 w-4" />
                Select a new date
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Book again for {activeRebookBooking.busNumber}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Choose a new journey date. We’ll check whether this bus is available and then open the seat layout.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="rebook-date" className="text-sm font-semibold text-slate-700">
                Journey date
              </label>
              <input
                id="rebook-date"
                type="date"
                min={toDateInputValue(new Date())}
                value={rebookDate}
                onChange={(event) => setRebookDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-[#264b8d] focus:ring-2 focus:ring-[#264b8d]/20"
              />
            </div>

            {rebookError && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{rebookError}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeRebookDialog}
                className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleConfirmRebook()}
                disabled={isRebookSearching}
                className="rounded-xl bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] px-5 py-3 font-semibold text-white shadow-md transition-all hover:from-[#1e3a6d] hover:to-[#17305a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRebookSearching ? 'Checking availability...' : 'Continue to seats'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeRebookBooking && activeRebookBus && (
        <SeatSelectionModal
          bus={activeRebookBus}
          searchData={{
            date: rebookDate,
            fullName: userProfile?.fullName || currentUser?.displayName || 'Passenger',
              origin: activeRebookBooking.origin || activeRebookBus.origin,
              destination: activeRebookBooking.destination || activeRebookBus.destination,
              time: activeRebookBooking.time || activeRebookBus.departureTime,
          }}
          price={getRebookPrice()}
          duration={formatDuration(activeRebookBus.departureTime, activeRebookBus.arrivalTime)}
            boardingTime={activeRebookBooking.time || activeRebookBus.departureTime}
          isOpen={isSeatModalOpen}
          onClose={() => {
            setIsSeatModalOpen(false);
            setActiveRebookBus(null);
            setActiveRebookBooking(null);
            setRebookDate('');
          }}
        />
      )}

      <footer className="mt-16 border-t border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 text-slate-300">
        <div className="w-full px-6 lg:px-10">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] p-2.5 shadow-lg">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">QuickSeat</span>
              </div>
              <p className="leading-relaxed text-slate-400">
                Making bus travel simple, comfortable and accessible for everyone.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="transition-colors hover:text-white">About Us</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Careers</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Press</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="transition-colors hover:text-white">Help Center</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Contact Us</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold text-white">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li>support@quickseat.com</li>
                <li>1-800-QUICKSEAT</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-slate-400">© 2026 QuickSeat. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400 transition-colors hover:text-white">Twitter</a>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">Facebook</a>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">Instagram</a>
                <a href="#" className="text-slate-400 transition-colors hover:text-white">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
