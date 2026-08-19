import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import ToolShell from '../../src/tools/ToolShell'
import SingleDebtCalculator from '../../src/tools/SingleDebtCalculator'
import { creditCardPayoff } from '../../src/tools/content/creditCardPayoff'
import { applySystemTheme } from '../../src/tools/theme'

applySystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToolShell content={creditCardPayoff}>
      <SingleDebtCalculator debtLabel="Credit card" defaultBalance={15000} defaultApr={24.99} defaultMinPayment={600} />
    </ToolShell>
  </StrictMode>,
)
