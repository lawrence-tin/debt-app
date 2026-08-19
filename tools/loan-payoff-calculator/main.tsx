import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import ToolShell from '../../src/tools/ToolShell'
import SingleDebtCalculator from '../../src/tools/SingleDebtCalculator'
import { loanPayoff } from '../../src/tools/content/loanPayoff'
import { applySystemTheme } from '../../src/tools/theme'

applySystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToolShell content={loanPayoff}>
      <SingleDebtCalculator debtLabel="Loan" defaultBalance={80000} defaultApr={13.5} defaultMinPayment={2200} />
    </ToolShell>
  </StrictMode>,
)
