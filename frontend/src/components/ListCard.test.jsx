import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ListCard, { MAX_PREVIEW } from './ListCard'

// <Link> only works inside a router, so tests wrap the component in a fake one.
// MemoryRouter keeps the "current URL" in memory instead of in a browser.
function renderCard(castList) {
    return render(
        <MemoryRouter>
            <ListCard castList={castList} />
        </MemoryRouter>
    )
}

// A small helper to build fake data: n entries like "Character 1 / Actor 1".
function makeList(entryCount) {
    return {
        id: 42,
        title: 'My dream cast',
        show: { title: 'Wicked' },
        cast_list_entry: Array.from({ length: entryCount }, (_, i) => ({
            id: i + 1,
            character: { name: `Character ${i + 1}` },
            performer: { full_name: `Actor ${i + 1}` },
        })),
    }
}

describe('ListCard', () => {
    it('shows the list title and the show title', () => {
        renderCard(makeList(2))

        expect(screen.getByText('My dream cast')).toBeInTheDocument()
        expect(screen.getByText('Wicked')).toBeInTheDocument()
    })

    it('links to the list page', () => {
        renderCard(makeList(2))

        // A <Link> renders as an <a>, whose role is "link".
        expect(screen.getByRole('link')).toHaveAttribute('href', '/cast-lists/42')
    })

    it('shows every character and performer when there are few', () => {
        renderCard(makeList(2))

        expect(screen.getByText('Character 1')).toBeInTheDocument()
        expect(screen.getByText('Actor 2')).toBeInTheDocument()
        // queryByText returns null (instead of throwing) when nothing matches,
        // which is what we want when asserting something is ABSENT.
        expect(screen.queryByText(/more/)).not.toBeInTheDocument()
    })

    it('previews only the first few entries and counts the rest', () => {
        renderCard(makeList(MAX_PREVIEW + 3))

        expect(screen.getAllByRole('listitem')).toHaveLength(MAX_PREVIEW)
        expect(screen.getByText('+3 more')).toBeInTheDocument()
        // The entry right after the preview must not be shown.
        expect(screen.queryByText(`Character ${MAX_PREVIEW + 1}`)).not.toBeInTheDocument()
    })

    it('does not crash on a list with no entries', () => {
        renderCard({ id: 1, title: 'Empty', show: { title: 'Rent' } })

        expect(screen.getByText('Empty')).toBeInTheDocument()
        expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })
})
