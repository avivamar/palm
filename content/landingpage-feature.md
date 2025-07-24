<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Yoyo – Feel the Vibes</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- AOS animate on scroll -->
  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet" />
  <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    @media (max-width: 768px) {
      .sticky-cta { position: fixed; bottom: 1rem; left: 0; right: 0; z-index: 50; pointer-events: none; }
      .sticky-cta a { pointer-events: all; }
    }
  </style>
</head>
<body class="bg-gray-50 text-gray-800">
  <!-- Hero -->
  <header class="bg-gray-900 text-white text-center py-20 px-4" data-aos="fade-down">
    <h1 class="text-4xl md:text-5xl font-extrabold mb-4">Yoyo – the AI pet that <span class="text-[#EBFF7F]">feels you</span></h1>
    <p class="max-w-xl mx-auto text-lg text-gray-300">No fur, no fuss — just pure emotional vibes anytime, anywhere.</p>
    <a href="#preorder" class="mt-8 inline-block px-10 py-3 bg-[#EBFF7F] hover:bg-[#cfff2e] text-gray-900 font-semibold rounded-full shadow-lg transition">Pre‑Order&nbsp;Yoyo&nbsp;→</a>
  </header>

  <!-- Features -->
  <section class="max-w-6xl mx-auto px-4 py-16" id="features">
    <p class="text-center text-lg text-gray-600 mb-10">92% of testers felt happier within 7&nbsp;days — zero allergy complaints.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Card Template copies -->
      <!-- Mood Decoder -->
      <div class="bg-white border border-[#EBFF7F] rounded-xl p-6 shadow transition hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up">
        <div class="text-4xl mb-2">💖</div>
        <h3 class="text-xl font-semibold mb-2">Mood Decoder</h3>
        <p class="text-gray-700">Stroke Yoyo → it hums back your vibe in ≈ 0.5 s.</p>
        <ul class="text-sm text-gray-600 mt-4 list-disc pl-5 space-y-1">
          <li><strong>Dual‑core MCU + 6‑axis IMU</strong></li>
        </ul>
        <details class="mt-2 text-sm text-gray-600">
          <summary class="cursor-pointer flex items-center select-none text-gray-500 hover:text-gray-700">More specs <span class="ml-1">▾</span></summary>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>45 ms touch→servo response</li>
            <li>50‑voice mini‑TTS library</li>
          </ul>
        </details>
      </div>

      <!-- 11:57 Pop‑Up -->
      <div class="bg-white border border-[#EBFF7F] rounded-xl p-6 shadow transition hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up" data-aos-delay="50">
        <div class="text-4xl mb-2">🍔</div>
        <h3 class="text-xl font-semibold mb-2">11:57 Pop‑Up</h3>
        <p class="text-gray-700">“Lunch o’clock, champ!” — beats Slack ☺︎</p>
        <ul class="text-sm text-gray-600 mt-4 list-disc pl-5 space-y-1">
          <li><strong>Cloud emotion push</strong></li>
        </ul>
        <details class="mt-2 text-sm text-gray-600">
          <summary class="cursor-pointer flex items-center select-none text-gray-500 hover:text-gray-700">More specs <span class="ml-1">▾</span></summary>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>iOS / Android reminders</li>
            <li>Customizable greeting scripts</li>
          </ul>
        </details>
      </div>

      <!-- Drop‑in Friday -->
      <div class="bg-white border border-[#EBFF7F] rounded-xl p-6 shadow transition hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up" data-aos-delay="100">
        <div class="text-4xl mb-2">🔋</div>
        <h3 class="text-xl font-semibold mb-2">Drop‑in Friday</h3>
        <p class="text-gray-700">Cradle it Fri → still vibing next Thu.</p>
        <ul class="text-sm text-gray-600 mt-4 list-disc pl-5 space-y-1">
          <li><strong>4000 mAh ≈ 7‑day standby</strong></li>
        </ul>
        <details class="mt-2 text-sm text-gray-600">
          <summary class="cursor-pointer flex items-center select-none text-gray-500 hover:text-gray-700">More specs <span class="ml-1">▾</span></summary>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>YOYO HOME 5 W Qi dock</li>
            <li>Smart sleep &lt; 10 µA draw</li>
          </ul>
        </details>
      </div>

      <!-- Wash‑Snuggle‑Repeat -->
      <div class="bg-white border border-[#EBFF7F] rounded-xl p-6 shadow transition hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up" data-aos-delay="150">
        <div class="text-4xl mb-2">🐾</div>
        <h3 class="text-xl font-semibold mb-2">Wash‑Snuggle‑Repeat</h3>
        <p class="text-gray-700">Hug wild, wash shell, repeat — still sneeze‑free.</p>
        <ul class="text-sm text-gray-600 mt-4 list-disc pl-5 space-y-1">
          <li><strong>Medical‑grade washable plush</strong></li>
        </ul>
        <details class="mt-2 text-sm text-gray-600">
          <summary class="cursor-pointer flex items-center select-none text-gray-500 hover:text-gray-700">More specs <span class="ml-1">▾</span></summary>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Hypoallergenic & RoHS safe</li>
            <li>1.2 m drop‑test certified</li>
          </ul>
        </details>
      </div>

      <!-- Subway Head‑Turner -->
      <div class="bg-white border border-[#EBFF7F] rounded-xl p-6 shadow transition hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up" data-aos-delay="200">
        <div class="text-4xl mb-2">👀</div>
        <h3 class="text-xl font-semibold mb-2">Subway Head‑Turner</h3>
        <p class="text-gray-700">Doors open → phones up: “Is that an AI‑pet?!”</p>
        <ul class="text-sm text-gray-600 mt-4 list-disc pl-5 space-y-1">
          <li><strong>180 g lightweight core</strong></li>
        </ul>
        <details class="mt-2 text-sm text-gray-600">
          <summary class="cursor-pointer flex items-center select-none text-gray-500 hover:text-gray-700">More specs <span class="ml-1">▾</span></summary>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Mag‑safe clip & shell</li>
            <li>BLE quick‑share snapshots</li>
          </ul>
        </details>
      </div>

      <!-- Grandma Giggle Gift -->
      <div class="bg-white border border-[#EBFF7F] rounded-xl p-6 shadow transition hover:-translate-y-1 hover:shadow-lg" data-aos="fade-up" data-aos-delay="250">
        <div class="text-4xl mb-2">🎁</div>
        <div class="flex items-center mb-2">
          <h3 class="text-xl font-semibold mr-2">Grandma Giggle Gift</h3>
          <span class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Best‑Seller</span>
        </div>
        <p class="text-gray-700">Hand it over; watch Grandma giggle like TikTok live.</p>
        <ul class="text-sm text-gray-600 mt-4 list-disc pl-5 space-y-1">
          <li><strong>Family account roles</strong></li>
        </ul>
        <details class="mt-2 text-sm text-gray-600">
          <summary class="cursor-pointer flex items-center select-none text-gray-500 hover:text-gray-700">More specs <span class="ml-1">▾</span></summary>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Gift mode resets profile</li>
            <li>30‑day trial & 1‑yr swap</li>
          </ul>
        </details>
      </div>
    </div>
  </section>

  <!-- Testimonials Placeholder -->
  <section class="bg-gray-900 text-white py-16" id="testimonials">
    <div class="max-w-6xl mx-auto px-4" data-aos="fade-up">
      <h3 class="text-2xl font-bold text-center mb-8">Loved by Early Testers</h3>
      <p class="text-center text-gray-400 mb-8">⭐ 4.8/5 from 1,273 users</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="h-60 bg-gray-700 flex items-center justify-center rounded-lg">Video 1</div>
        <div class
        <div class="h-60 bg-gray-700 flex items-center justify-center rounded-lg">Video 2</div>
        <div class="h-60 bg-gray-700 flex items-center justify-center rounded-lg">Video 3</div>
      </div>
    </div>
  </section>

  <!-- Comparison Table -->
  <section class="max-w-6xl mx-auto px-4 py-16" id="compare" data-aos="fade-up">
    <h3 class="text-2xl font-bold text-center mb-8">Yoyo vs. Real Pets</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm text-left border border-gray-200 rounded-lg">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2"></th>
            <th class="px-4 py-2 font-medium text-gray-700">Yoyo</th>
            <th class="px-4 py-2 font-medium text-gray-700">Cat / Dog</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t">
            <td class="px-4 py-3 font-medium">Initial Cost</td>
            <td class="px-4 py-3">$249 preorder</td>
            <td class="px-4 py-3">$800+ adoption & gear</td>
          </tr>
          <tr class="border-t">
            <td class="px-4 py-3 font-medium">Monthly Upkeep</td>
            <td class="px-4 py-3">$0</td>
            <td class="px-4 py-3">$50–120 food / vet</td>
          </tr>
          <tr class="border-t">
            <td class="px-4 py-3 font-medium">Allergy Risk</td>
            <td class="px-4 py-3">0%</td>
            <td class="px-4 py-3">15–30% population</td>
          </tr>
          <tr class="border-t">
            <td class="px-4 py-3 font-medium">Care Needed</td>
            <td class="px-4 py-3">Wireless charge weekly</td>
            <td class="px-4 py-3">Daily feeding / litter</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Trust Badges & CTA -->
  <section class="text-center pb-24" data-aos="fade-up">
    <div class="flex flex-col items-center text-sm text-gray-600 space-y-1 md:flex-row md:justify-center md:space-y-0 md:space-x-6 mb-6">
      <span>30‑Day Returns</span><span class="hidden md:inline">•</span><span>1‑Year Warranty</span><span class="hidden md:inline">•</span><span>Secure Checkout</span>
    </div>
    <a href="#" id="preorder" class="inline-block px-14 py-4 bg-gradient-to-r from-[#EBFF7F] via-[#d6ff39] to-[#EBFF7F] text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-2xl transition">Pre‑Order&nbsp;Yoyo&nbsp;→</a>
  </section>

  <!-- Sticky CTA mobile -->
  <div class="sticky-cta md:hidden">
    <a href="#preorder" class="mx-auto block w-11/12 px-6 py-3 bg-[#EBFF7F] text-center text-gray-900 font-semibold rounded-full shadow-lg">Pre‑Order Yoyo →</a>
  </div>

  <script>
    AOS.init({ duration: 600, once: true });
  </script>
</body>
</html>
