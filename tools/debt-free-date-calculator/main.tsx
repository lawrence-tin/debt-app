import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import ToolShell from '../../src/tools/ToolShell'
import MultiDebtCalculator from '../../src/tools/MultiDebtCalculator'
import { debtFreeDate } from '../../src/tools/content/debtFreeDate'
import { applySystemTheme } from '../../src/tools/theme'

applySystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToolShell content={debtFreeDate}>
      <MultiDebtCalculator emphasis="date" />
    </ToolShell>
  </StrictMode>,
)
