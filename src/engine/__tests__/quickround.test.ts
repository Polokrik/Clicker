import { describe, expect, it } from 'vitest'
import { makeQuickCard, nextQuickItem } from '../quickround'
import type { Item } from '../../content/schema'

const item = (id: string, word: string, wrong: string[] = []): Item =>
  ({
    id, chunk: word, word, translation: `gloss ${id}`, example: word, example_translation: '', cloze: '___',
    tiles: ['a', 'b', 'c'], distractor_tiles: ['d'], notes: '', tags: [], wrong, strict: true, allowSpot: true,
  }) as Item

describe('quick round', () => {
  it('vrai : la bonne forme', () => {
    const c = makeQuickCard(item('1', 'un problème', ['une problème']), [], () => 0.1)
    expect(c).toMatchObject({ match: true, form: 'un problème', answer: 'un problème' })
  })

  it('faux : une mauvaise réponse type quand elle existe', () => {
    const c = makeQuickCard(item('1', 'un problème', ['une problème', 'la problème']), [], () => 0.9)
    expect(c.match).toBe(false)
    expect(['une problème', 'la problème']).toContain(c.form)
    expect(c.form).not.toBe(c.answer)
  })

  it('faux sans mauvaises réponses : la forme d’un autre item', () => {
    const a = item('1', 'to order')
    const b = item('2', 'to book')
    const c = makeQuickCard(a, [a, b], () => 0.9)
    expect(c).toMatchObject({ match: false, form: 'to book' })
  })

  it('jamais deux fois le même item d’affilée (si le pool le permet)', () => {
    const pool = [item('1', 'a'), item('2', 'b'), item('3', 'c')]
    for (let i = 0; i < 50; i++) expect(nextQuickItem(pool, '2').id).not.toBe('2')
    expect(nextQuickItem([pool[0]], '1').id).toBe('1')
  })
})
