const VerifyFailed = () => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="bg-white p-8 rounded shadow text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Verification Failed</h1>
      <p className="text-gray-700">Invalid or expired link. Please try registering again.</p>
    </div>
  </div>
);
export default VerifyFailed;
