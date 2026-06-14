# Maximum Rent a Car — Bilingual Car Rental Platform

A production web application for **Maximum Rent a Car**, a premium car rental agency based in Herzegovina, Bosnia and Herzegovina. The platform combines a marketing website with a full date-availability reservation system and an admin panel for managing bookings.

**Live:** [maximum-rent.com](https://maximum-rent.com)

---

## Overview

The application lets visitors browse the fleet, check vehicle availability for specific dates, and submit reservation inquiries — all in two languages (Croatian/English). The agency manages incoming inquiries through a password-protected admin panel, confirming or rejecting reservations with a single click, while clients receive automated email updates and the owner gets instant Telegram notifications.

The system follows an **inquiry-based model** (no online payments): a client requests a vehicle, the agency confirms, and the vehicle is automatically marked as unavailable for that period.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Framer Motion (animations)
- **Database:** PostgreSQL (Supabase), Prisma ORM
- **Internationalization:** next-intl (Croatian / English)
- **Theming:** next-themes (dark/light, dark default)
- **Email:** Resend (transactional emails)
- **Notifications:** Telegram Bot API
- **Storage:** Supabase Storage (vehicle images)
- **Hosting:** Vercel (with Vercel Cron jobs)
- **Maps:** Google Maps embed

---

## Key Features

### Public Website
- **Fully bilingual (HR/EN)** with locale-prefixed routing and complete translation parity
- **Responsive, mobile-first design** with dark/light theme and smooth, uniform theme transitions
- **Self-hosted hero video** background with live "Open/Closed" status indicator (Europe/Sarajevo timezone)
- **Pages:** Home, Fleet, About, Business Offer, Rental Terms, Contact
- **Google rating display** and interactive Google Maps with all 6 branch locations

### Reservation System (date availability)
- **Availability search:** clients pick dates and a pickup location, and only vehicles that are actually free for that period are shown
- **Overlap detection:** only confirmed reservations and manual blocks reduce availability; pending inquiries do not
- **Inquiry modal** per vehicle with date/time selection, location pickers, and a WhatsApp fallback
- **Location selection** for pickup and return across all branches

### Fleet
- **Vehicle cards** with full specs (class, year, transmission, fuel, seats, price)
- **Image gallery** on each card — arrows, dots, and touch swipe — with a **full-screen lightbox** (keyboard + swipe navigation, rendered via React portal)
- **Type filters** (Sedan, SUV, Luxury, Compact, Transport…) with multi-category support per vehicle

### Admin Panel
- **Password-protected** route (httpOnly cookie, SHA-256, middleware-guarded, `noindex`)
- **Inquiry dashboard** with status tabs (pending / confirmed / cancelled) and time-range filters (24h / 7d / 30d)
- **One-click confirm/cancel** with transactional double-booking prevention
- **Manual vehicle blocks** for service/maintenance periods
- Theme-aware and responsive

### Automation & Notifications
- **Client emails** on confirmation/cancellation (localized HR/EN, via Resend)
- **Owner Telegram notifications** on every new inquiry (timestamp, client, vehicle, period)
- **Automated database cleanup** via Vercel Cron — removes records 14 days after the rental period ends, keeping the database lean while never touching active or upcoming bookings

---

## Architecture Notes

- Server Components for data fetching; Client Components only where interactivity is required
- Zod validation on all API routes
- All dates stored as UTC, displayed in the Europe/Sarajevo timezone
- The `Inquiry` model doubles as the reservation entity (statuses: NEW → CONFIRMED / CANCELLED), avoiding a redundant booking table
- Availability is computed with an interval-overlap query against confirmed inquiries and manual blocks

---

## Project Structure
