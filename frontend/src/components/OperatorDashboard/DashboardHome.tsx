import { useState } from 'react';
import {
  Bus as BusIcon, Plus, Edit3, Users, Clock, MapPin, TrendingUp,
  BarChart3, Trash2,
} from 'lucide-react';
import type { Bus } from '../../types/bus';

interface DashboardHomeProps {
  registeredBuses: Bus[];
  isLoadingBuses: boolean;
  currentMonthRevenue: number;
  isLoadingRevenue: boolean;
  currentMonthName: string;
  onShowBusModal: () => void;
  onUpdateBus: (bus: Bus) => void;
  onDeleteBus: (bus: Bus) => void;
}

export function DashboardHome({
  registeredBuses,
  isLoadingBuses,
  currentMonthRevenue,
  isLoadingRevenue,
  currentMonthName,
  onShowBusModal,
  onUpdateBus,
  onDeleteBus,
}: DashboardHomeProps) {
  const totalBuses = registeredBuses.length;
  const activeRoutes = new Set(
    registeredBuses.map((bus) => bus.routeNumber || `${bus.origin}-${bus.destination}`)
  ).size;

  const stats = [
    { label: 'Total Buses', value: totalBuses.toString(), icon: BusIcon },
    { label: 'Active Routes', value: activeRoutes.toString(), icon: BarChart3 },
    { label: 'Active Buses', value: totalBuses.toString(), icon: Users },
    {
      label: `${currentMonthName} Revenue`,
      value: isLoadingRevenue ? 'Loading...' : `Rs. ${currentMonthRevenue.toLocaleString()}`,
      icon: TrendingUp,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Operator Dashboard</h1>
        <p className="text-lg text-slate-600">Welcome back! Manage your buses and track performance</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-slate-100 rounded-3xl shadow-md border-2 border-slate-200 p-8 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base text-slate-600 mb-2 font-medium">{stat.label}</p>
                <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-600 shadow-lg">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Registered Buses List */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 bg-gradient-to-b from-[#264b8d] to-[#1e3a6d] rounded-full" />
            <h2 className="text-2xl font-bold text-slate-900">Registered Buses</h2>
          </div>
          <button
            onClick={onShowBusModal}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-lg hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Add New Bus
          </button>
        </div>

        {isLoadingBuses ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#264b8d] mx-auto mb-4" />
              <p className="text-slate-600">Loading buses...</p>
            </div>
          </div>
        ) : registeredBuses.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md border-2 border-slate-100 p-12 text-center">
            <BusIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No buses registered yet</h3>
            <p className="text-slate-600 mb-6">Get started by adding your first bus</p>
            <button
              onClick={onShowBusModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Bus
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {registeredBuses.map((bus) => (
              <div
                key={bus._id ?? `${bus.busNumber}-${bus.routeNumber ?? ''}`}
                className="bg-white rounded-3xl shadow-md border-2 border-slate-100 p-8 hover:shadow-xl transition-all group hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <BusIcon className="w-12 h-12 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{bus.busNumber}</h3>
                      {bus.routeNumber && (
                        <p className="text-sm text-[#264b8d] font-semibold mb-1">Route {bus.routeNumber}</p>
                      )}
                      <p className="text-base text-slate-600 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {bus.origin} → {bus.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateBus(bus)}
                      className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                      title="Update Bus"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDeleteBus(bus)}
                      className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                      title="Delete Bus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-200">
                  <div>
                    <p className="text-sm text-slate-500 mb-2 font-medium">Seats</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5 text-slate-600" />
                      {bus.seatCapacity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2 font-medium">Departure</p>
                    <p className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5 text-slate-600" />
                      {bus.departureTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2 font-medium">Operating</p>
                    <p className="font-bold text-slate-900 capitalize text-lg">{bus.operatingDays}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}