"use client";
// The live demo is made for bigger screens: phones go to the home page instead
import { useEffect } from "react";

export default function DesktopOnly() {
  useEffect(() => { if (matchMedia("(max-width: 760px)").matches) location.replace("/"); }, []);
  return null;
}
