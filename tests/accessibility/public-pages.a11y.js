import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PUBLIC_PAGES = [
  { path: '/landing', name: 'página de inicio' },
  { path: '/login', name: 'inicio de sesión' },
  { path: '/requisitos', name: 'requisitos' },
  { path: '/faq', name: 'preguntas frecuentes' },
]

for (const publicPage of PUBLIC_PAGES) {
  test(`${publicPage.name} no presenta infracciones WCAG A o AA detectables`, async ({
    page,
  }, testInfo) => {
    const response = await page.goto(publicPage.path)

    expect(response, `${publicPage.path} debe responder correctamente`).not.toBeNull()
    expect(response.status(), `${publicPage.path} debe responder sin error HTTP`).toBeLessThan(400)

    await page.locator('body').waitFor()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    await testInfo.attach('resultado-axe', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    })

    const violations = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target),
    }))

    expect(
      violations,
      `Se detectaron infracciones automáticas en ${publicPage.path}`,
    ).toEqual([])
  })
}
