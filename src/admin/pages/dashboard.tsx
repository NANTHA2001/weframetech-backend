'use client';

import type { AdminViewServerProps } from 'payload';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardView = (props: AdminViewServerProps) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/api/dashboard');
      setData(res.data);
    };
    fetchData();
  }, []);

  if (!data) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Organizer Dashboard</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Summary</h2>
        <p>Total Events: {data.summary.totalEvents}</p>
        <p>Total Confirmed: {data.summary.totalConfirmed}</p>
        <p>Total Waitlisted: {data.summary.totalWaitlisted}</p>
        <p>Total Canceled: {data.summary.totalCanceled}</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Upcoming Events</h2>
        {data.upcomingEvents.map((ev: any) => (
          <div key={ev.id} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            <strong>{ev.title}</strong> ({new Date(ev.date).toLocaleString()})<br />
            Capacity: {ev.capacity}, Confirmed: {ev.confirmedCount}, Waitlisted: {ev.waitlistedCount}, Canceled: {ev.canceledCount}<br />
            Filled: {ev.percentageFilled}%
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Recent Activity</h2>
        {data.recentActivity.map((log: any) => (
          <div key={log.id} style={{ marginBottom: '0.5rem' }}>
            {log.action} — {new Date(log.createdAt).toLocaleString()}
          </div>
        ))}
      </section>
    </div>
  );
}

export default DashboardView;
