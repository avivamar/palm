// Minimal instrumentation file to prevent OpenTelemetry chunk errors
// This file is required by Next.js when OpenTelemetry dependencies are present

export async function register() {
  // Empty implementation to prevent module loading errors
  // OpenTelemetry packages are present as dependencies but not actively used
  if (process.env.NODE_ENV === 'development') {
    console.log('Instrumentation registered (minimal implementation)');
  }
}
