// Runs once before every test file.

// Adds readable matchers like expect(el).toBeInTheDocument()
import '@testing-library/jest-dom/vitest'

// Unmount whatever a test rendered so tests can't leak into each other
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())
