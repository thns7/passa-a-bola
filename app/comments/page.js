"use client";

import { Suspense } from "react";
import CommentsPage from "../components/CommentsPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando comentários...</div>}>
      <CommentsPage />
    </Suspense>
  );
}
