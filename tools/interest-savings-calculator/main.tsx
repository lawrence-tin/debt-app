import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import ToolShell from '../../src/tools/ToolShell'
import MultiDebtCalculator from '../../src/tools/MultiDebtCalculator'
import { interestSavings } from '../../src/tools/content/interestSavings'
import { applySystemTheme } from '../../src/tools/theme'

applySystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToolShell content={interestSavings}>
      <MultiDebtCalculator emphasis="interest" />
    </ToolShell>
  </StrictMode>,
)
