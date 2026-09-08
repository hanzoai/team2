/**
 * THE ISSUES SCREEN: the head, and the board under it.
 *
 * The head is chrome and the board is data, which is why they are siblings
 * rather than nested — a header that disappears while its contents load makes
 * three screens out of one, and the reference draws the same band in every
 * state.
 *
 * One screen serves two addresses. `/projects/:id/issues` is a project's board
 * and `/issues` is every project's; they differ in what the source is scoped to
 * and in what the trail says, and in nothing else. A second component would be
 * two things to keep in step.
 */
import { EmptyState } from '@hanzo/ui/product'
import { SquareCheck } from '@hanzogui/lucide-icons-2'
import { useState } from 'react'
import { useParams } from 'react-router'
import { YStack } from '@hanzo/ui'

import { useSpace } from '~/data/space.tsx'
import { standingIs, useBoard, useCrew, useProject } from '~/serve'
import { Board, NEW } from './board/Board.tsx'
import { standby } from './board/fixture.ts'
import type { Priority } from './board/model.ts'
import { Head, VIEWS, type Step, type View } from './Head.tsx'

/** The view in the address, or Kanban — the one this build draws. */
const viewOf = (asked: string | undefined): View =>
  VIEWS.find((v) => v.id === asked)?.id ?? 'kanban'

export const Tracker = () => {
  const { id, view } = useParams()
  const project = useProject(id)
  const { standing } = useSpace()
  const source = useBoard(id) ?? standby(standingIs(standing))
  const add = source.add?.bind(source)
  const people = useCrew(id)
  const [only, setOnly] = useState<Priority[]>([])
  const here = viewOf(view)

  const base = id ? `/projects/${id}/issues` : '/issues'
  const trail: Step[] = [
    { label: 'Your projects', to: '/projects' },
    ...(id ? [{ label: project?.name ?? '…', to: base }] : []),
    { label: id ? 'Issues' : 'All issues' },
  ]

  return (
    <YStack flex={1} minH={0}>
      <Head
        trail={trail}
        title={id ? 'Issues' : 'All issues'}
        base={base}
        here={here}
        people={people}
        only={only}
        onOnly={setOnly}
        onAdd={add && (() => void add('backlog', NEW))}
      />
      {here === 'kanban' ? (
        <Board source={source} only={only} />
      ) : (
        <EmptyState
          icon={SquareCheck}
          title={VIEWS.find((v) => v.id === here)!.label}
          description="The same issues, in another shape. Not built yet."
        />
      )}
    </YStack>
  )
}
