import { useRef, useState } from 'react';

const CATEGORY_GUIDANCE = {
  plastic: { category: 'Plastic', instruction: 'Blue bin / Recycle' },
  paper: { category: 'Paper', instruction: 'Blue bin / Recycle' },
  metal: { category: 'Metal', instruction: 'Grey bin / Special disposal' },
  glass: { category: 'Glass', instruction: 'Glass recycling bin' },
  food: { category: 'Food', instruction: 'Green bin / Compost' },
  electronic: { category: 'Electronic', instruction: 'E-waste collection center' },
  other: { category: 'Other', instruction: 'Black bin / General waste' }
};

const fileToBase64 = (imageFile) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

const getErrorMessage = (error) => {
  if (!error) return 'OpenRouter API request failed';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
};

function WasteScanner() {
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef();

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResult(null);
    await classifyImage(file);
  }

  async function classifyImage(imageFile) {
    setLoading(true);
    try {
      const base64 = await fileToBase64(imageFile);
      const response = await fetch('http://localhost:5000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          mediaType: imageFile.type || 'image/jpeg'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data?.error));
      }

      const parsed = data;
      const key = CATEGORY_GUIDANCE[parsed.category] ? parsed.category : 'other';

      setResult({
        label: parsed.itemName || 'Unknown item',
        ...CATEGORY_GUIDANCE[key],
        confidence: Math.round(Number(parsed.confidence) || 0)
      });
    } catch (error) {
      setResult({ label: 'Unable to classify', category: 'Unknown', instruction: 'Try again with a clearer image', confidence: 0 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-white">Waste Scanner</h2>
        <p className="mt-2 text-slate-300">Upload or capture a waste item photo to get recycling instructions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
        <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Upload an image</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/40 p-3 text-slate-200"
            />
            {imageUrl && (
              <div className="overflow-hidden rounded-3xl border border-slate-700">
                <img id="waste-image" ref={imageRef} src={imageUrl} alt="Waste sample" className="h-72 w-full object-cover" />
              </div>
            )}
            <div className="rounded-3xl border border-green-400/20 bg-green-500/10 p-4 text-sm text-green-200">Model status: Gemini AI ready</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-white">Result</h3>
          {loading && <p className="mt-4 text-slate-300">Classifying item...</p>}
          {result ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-400">Detected Item</p>
                <p className="mt-2 text-xl font-semibold text-white">{result.label}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-400">Category</p>
                <p className="mt-2 text-lg font-semibold text-white">{result.category}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/40 p-4">
                <p className="text-sm text-slate-400">Instructions</p>
                <p className="mt-2 text-lg font-semibold text-white">{result.instruction}</p>
              </div>
              <div className="text-sm text-slate-300">Confidence: {result.confidence}%</div>
            </div>
          ) : (
            <p className="mt-4 text-slate-300">Upload a photo to see recycling guidance.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WasteScanner;
