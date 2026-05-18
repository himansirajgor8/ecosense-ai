import { useRef, useState } from 'react';

const wasteCategories = {
  plastic: {
    icon: '🧴',
    color: '#3b82f6',
    bin: 'Blue Bin',
    title: 'Plastic Waste',
    instructions: [
      'Rinse the item before disposing',
      'Remove any food residue',
      'Place in Blue recycling bin',
      'Do not mix with food waste'
    ],
    tip: 'Plastic takes 400+ years to decompose. Always recycle!'
  },
  paper: {
    icon: '📄',
    color: '#f59e0b',
    bin: 'Blue Bin',
    title: 'Paper Waste',
    instructions: [
      'Keep paper dry before disposing',
      'Remove any plastic coating',
      'Place in Blue recycling bin',
      'Shred confidential documents first'
    ],
    tip: 'Recycling one ton of paper saves 17 trees!'
  },
  food: {
    icon: '🍎',
    color: '#22c55e',
    bin: 'Green Bin',
    title: 'Food / Organic Waste',
    instructions: [
      'Place in Green compost bin',
      'Can be used for home composting',
      'Do not mix with plastic or metal',
      'Use within 24 hours of disposal'
    ],
    tip: 'Food waste can be converted to compost for plants!'
  },
  metal: {
    icon: '🥫',
    color: '#6b7280',
    bin: 'Grey Bin',
    title: 'Metal Waste',
    instructions: [
      'Rinse cans and tins before disposing',
      'Crush if possible to save space',
      'Place in Grey bin or metal collection',
      'Sharp metals should be wrapped safely'
    ],
    tip: 'Recycling aluminum saves 95% of the energy needed!'
  },
  glass: {
    icon: '🍾',
    color: '#8b5cf6',
    bin: 'Purple Bin',
    title: 'Glass Waste',
    instructions: [
      'Handle with care, glass is sharp',
      'Rinse bottles and jars',
      'Place in glass recycling bin',
      'Do not mix with ceramics or mirrors'
    ],
    tip: 'Glass can be recycled infinitely without losing quality!'
  },
  electronic: {
    icon: '📱',
    color: '#ef4444',
    bin: 'E-Waste Center',
    title: 'Electronic Waste',
    instructions: [
      'Never throw in regular bin',
      'Take to nearest e-waste collection center',
      'Remove batteries separately',
      'Check manufacturer take-back programs'
    ],
    tip: 'E-waste contains toxic materials harmful to environment!'
  },
  other: {
    icon: '🗑️',
    color: '#6b7280',
    bin: 'Black Bin',
    title: 'General Waste',
    instructions: [
      'Place in general waste black bin',
      'Check if any parts can be recycled',
      'Reduce usage where possible'
    ],
    tip: 'When in doubt, reduce and reuse first!'
  }
};

const allowedCategories = new Set(Object.keys(wasteCategories));

const fileToBase64 = (imageFile) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

function WasteScan() {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, or WEBP image.');
      return;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleImageSelect = (event) => {
    handleImageFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleImageSelect;
    input.click();
  };

  const classifyWaste = async (selectedImageFile) => {
    if (!selectedImageFile) return;

    setLoading(true);
    setResult(null);
    setError(null);

    let data;

    try {
      const geminiKey = 'AIzaSyAIdWSXxCWyRwse0TpTAAyMlxkQ9-ypWuk';

      if (!geminiKey) {
        throw new Error('Missing VITE_GEMINI_KEY');
      }

      const base64 = await fileToBase64(selectedImageFile);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: selectedImageFile.type,
                      data: base64
                    }
                  },
                  {
                    text: `You are a waste classification expert.
Look at this image and classify the waste.
Reply ONLY in JSON, no extra text:
{
  "category": "plastic" or "paper" or "metal" or "glass" or "food" or "electronic" or "other",
  "itemName": "name of item",
  "confidence": 85
}`
                  }
                ]
              }
            ]
          })
        }
      );

      data = await response.json();
      console.log('API Response:', JSON.stringify(data));

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Gemini API request failed');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      const category = allowedCategories.has(parsed.category) ? parsed.category : 'other';

      setResult({
        category,
        itemName: parsed.itemName,
        confidence: parsed.confidence,
        ...wasteCategories[category]
      });
    } catch (error) {
      console.error('Full error:', JSON.stringify(error));
      console.error('Error:', error);
      console.error('Data received:', JSON.stringify(data));
      console.error('Data:', data);
      setError('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleImageFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-green-400/20 bg-gradient-to-br from-[#064e3b] to-[#052e2b] p-5 text-white shadow-xl md:p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-green-200">AI Waste Classifier</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Waste Scanner</h1>
        <p className="mt-2 text-slate-200">Scan any waste item to know how to dispose it</p>
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-xl md:p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />

        {!imageUrl ? (
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(event) => event.key === 'Enter' && openFilePicker()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-5 text-center transition md:min-h-96 md:p-8 ${dragActive ? 'border-green-400 bg-green-500/10' : 'border-slate-600 bg-slate-950/40 hover:border-green-400 hover:bg-green-500/10'}`}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-5xl shadow-sm">📷</div>
            <h2 className="mt-6 text-xl font-semibold text-white md:text-2xl">Click to upload or drag and drop</h2>
            <p className="mt-2 text-sm text-slate-400">Supports JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.58fr_0.42fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/40">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Selected waste item"
                className="h-64 w-full object-contain md:h-[420px]"
              />
            </div>
            <div className="flex flex-col justify-center rounded-3xl border border-slate-700 bg-slate-950/40 p-5 md:p-6">
              <h2 className="text-xl font-semibold text-white md:text-2xl">Image ready</h2>
              <p className="mt-2 text-slate-300">Run the AI scan to classify this item and get disposal instructions.</p>
              <button
                type="button"
                onClick={() => classifyWaste(imageFile)}
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                Scan Now
              </button>
              <button
                type="button"
                onClick={resetScanner}
                className="mt-4 w-full text-center text-sm font-semibold text-green-300 hover:text-green-200 md:text-left"
              >
                Change Image
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openFilePicker}
            className="w-full rounded-2xl border border-green-400/30 bg-green-500/15 px-5 py-3 text-sm font-semibold text-green-200 transition hover:bg-green-500/25 sm:w-auto"
          >
            Upload Image
          </button>
          <button
            type="button"
            onClick={openCamera}
            className="w-full rounded-2xl border border-slate-600 bg-slate-950/40 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 sm:w-auto"
          >
            Use Camera
          </button>
        </div>
      </section>

      {error && (
        <section className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-red-200 shadow-inner">
          {error}
        </section>
      )}

      {loading && (
        <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-8 text-center shadow-xl">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-700 border-t-green-500" />
          <p className="mt-5 text-lg font-semibold text-white">AI is analyzing your waste item...</p>
          <div className="mx-auto mt-5 h-3 max-w-md overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-green-500" />
          </div>
        </section>
      )}

      {result && (
        <section
          className="animate-[fadeIn_0.35s_ease-out] rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-xl md:p-6"
          style={{ borderLeft: `4px solid ${result.color}` }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="text-6xl">{result.icon}</span>
              <div>
                <p className="text-sm text-slate-400">Detected Item: {result.itemName}</p>
                <h2 className="text-2xl font-bold text-white md:text-3xl">Category: {result.title}</h2>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <span className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100">🗑️ {result.bin}</span>
              <span className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-200 ring-1 ring-green-400/30">Confidence: {result.confidence}%</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.62fr_0.38fr]">
            <div>
              <h3 className="text-xl font-semibold text-white">How to Dispose:</h3>
              <ul className="mt-4 space-y-3">
                {result.instructions.map((instruction) => (
                  <li key={instruction} className="rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-slate-300">
                    ✅ {instruction}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl p-5 text-white" style={{ backgroundColor: result.color }}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">Did you know?</p>
              <p className="mt-3 text-lg font-semibold">💡 {result.tip}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetScanner}
            className="mt-8 w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 sm:w-auto"
          >
            Scan Another Item
          </button>
        </section>
      )}
    </div>
  );
}

export default WasteScan;
