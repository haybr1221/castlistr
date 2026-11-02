// ─────────────────────────────────────────────────────────────────────────────
// GUIDED EXAMPLE: testing a component that only displays data
//
// Every component test follows the same 3 steps ("Arrange, Act, Assert"):
//   1. ARRANGE – render the component with the props you want to test
//   2. ACT     – (optional) do something a user would do: click, type...
//   3. ASSERT  – check what's on the screen
//
// This component has no clicking, so we only need steps 1 and 3.
// ─────────────────────────────────────────────────────────────────────────────

// `render` draws the component into the fake browser (jsdom).
// `screen` is how we look at what got drawn, the way a user would see it.
import { render, screen } from '@testing-library/react'
import DisplayCharacters from './DisplayCharacters'

// `describe` groups related tests under one name. It's just for organizing output.
describe('DisplayCharacters', () => {

    // `it('...')` is one test. Read it as a sentence:
    // "DisplayCharacters shows the name of every character".
    it('shows the name of every character', () => {
        // ARRANGE: the component expects a `charList` prop (see DisplayCharacters.jsx).
        // We make up fake data. It only needs the fields the component uses: id + name.
        const characters = [
            { id: 1, name: 'Elphaba' },
            { id: 2, name: 'Glinda' },
        ]
        render(<DisplayCharacters charList={characters} />)

        // ASSERT: `getByText` looks for an element containing that text. If it can't find
        // one it THROWS, which fails the test. So just calling it is already a check,
        // and `toBeInTheDocument()` makes that intention readable.
        expect(screen.getByText('Elphaba')).toBeInTheDocument()
        expect(screen.getByText('Glinda')).toBeInTheDocument()
    })

    it('renders one list item per character, in order', () => {
        render(
            <DisplayCharacters
                charList={[
                    { id: 1, name: 'Elphaba' },
                    { id: 2, name: 'Glinda' },
                    { id: 3, name: 'Fiyero' },
                ]}
            />
        )

        // `getAllByRole('listitem')` finds every <li> (the "role" of an <li> is "listitem").
        // Querying by role is preferred over class names because it matches how
        // users and screen readers experience the page, not how it was coded.
        const items = screen.getAllByRole('listitem')

        expect(items).toHaveLength(3)
        // `.map` pulls out each item's text so we can compare the whole order at once.
        expect(items.map((li) => li.textContent)).toEqual(['Elphaba', 'Glinda', 'Fiyero'])
    })

    it('renders an empty list when there are no characters', () => {
        render(<DisplayCharacters charList={[]} />)

        // Three query flavors, worth remembering:
        //   getBy...    → must exist, throws if missing        (use to assert PRESENCE)
        //   queryBy...  → returns null if missing, no throw    (use to assert ABSENCE)
        //   findBy...   → waits for it to appear (async)       (use after fetches)
        // Here we want to prove there are no items, so we use queryAllBy (the "all" form
        // returns an empty array instead of throwing).
        expect(screen.queryAllByRole('listitem')).toHaveLength(0)
        // The <ul> itself should still be there, just empty.
        expect(screen.getByRole('list')).toBeInTheDocument()
    })
})
