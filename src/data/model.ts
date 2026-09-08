/**
 * The platform's vocabulary, as this client needs it.
 *
 * These ids are the server's — every one appears in cloud `apps/team/model.json`,
 * which is the model the transactor loads and the only authority on them. They
 * are strings on the wire, so they are `const` here and nothing derives them.
 *
 * A document is a bag with four fields the platform puts on all of them; the
 * rest is the class's own. The shapes below carry the fields this product
 * paints and nothing more — a class has dozens, and copying all of them would
 * be a second model to keep in step with the first.
 */

export const Class = {
  project: 'tracker:class:Project',
  issue: 'tracker:class:Issue',
  status: 'tracker:class:IssueStatus',
  milestone: 'tracker:class:Milestone',
  component: 'tracker:class:Component',
  person: 'contact:class:Person',
  channel: 'chunter:class:Channel',
  message: 'chunter:class:ChatMessage',
  notice: 'notification:class:ActivityInboxNotification',
  context: 'notification:class:DocNotifyContext',
  tag: 'tags:class:TagReference',
} as const

export const Tx = {
  create: 'core:class:TxCreateDoc',
  update: 'core:class:TxUpdateDoc',
  remove: 'core:class:TxRemoveDoc',
  mixin: 'core:class:TxMixin',
} as const

/** The four fields the platform puts on every document. */
export type Doc = {
  _id: string
  _class: string
  space: string
  modifiedOn: number
  modifiedBy?: string
  createdOn?: number
  createdBy?: string
}

/**
 * A workflow state's category, and there are exactly four.
 *
 * The platform stores an ordinal on `IssueStatus.category`; these are the ids
 * that ordinal names. A board's columns are the space's statuses grouped by it,
 * which is why the theme has four state colours and not one per status.
 */
export const Category = {
  backlog: 'tracker:issueStatusCategory:Backlog',
  todo: 'tracker:issueStatusCategory:Unstarted',
  doing: 'tracker:issueStatusCategory:Started',
  done: 'tracker:issueStatusCategory:Completed',
  cancelled: 'tracker:issueStatusCategory:Cancelled',
} as const

/**
 * Priority, as the platform ranks it: 0 none, 1 urgent, 2 high, 3 medium,
 * 4 low. The theme collapses these to two tiers for colour; the label keeps
 * all four, because the label is where the distinction is real.
 */
export const Priority = { none: 0, urgent: 1, high: 2, medium: 3, low: 4 } as const
export const priorityName = ['No priority', 'Urgent', 'High', 'Medium', 'Low'] as const

export type Project = Doc & {
  name: string
  description?: string
  identifier: string
  sequence: number
  defaultIssueStatus?: string
  members?: string[]
  private?: boolean
  archived?: boolean
  icon?: string
}

export type Status = Doc & {
  name: string
  description?: string
  /** One of `Category`. A board column is a group of statuses sharing one. */
  category: string
  /** The platform's own ordering within a category. */
  rank?: string
  color?: number
}

export type Issue = Doc & {
  title: string
  description?: string
  /** A `Status._id`. The column a card sits in. */
  status: string
  priority: number
  /** The per-project ordinal that makes `PROJ-42`. */
  number: number
  /** A `Person._id`, or null when nobody holds it. */
  assignee?: string | null
  component?: string | null
  milestone?: string | null
  dueDate?: number | null
  /** Points, whatever the space means by them. */
  estimation?: number
  reportedTime?: number
  remainingTime?: number
  /** Collection sizes the platform maintains; the card paints them. */
  subIssues?: number
  comments?: number
  attachments?: number
  labels?: number
  /** The platform's own ordering within a column. */
  rank?: string
}

export type Person = Doc & {
  name: string
  avatar?: string | null
  city?: string
}

export type Channel = Doc & {
  name: string
  topic?: string
  description?: string
  private?: boolean
  archived?: boolean
  members?: string[]
}

export type Message = Doc & {
  message: string
  attachedTo?: string
  attachedToClass?: string
  collection?: string
  editedOn?: number
  reactions?: number
}

export type Notice = Doc & {
  title?: string
  body?: string
  isViewed: boolean
  docNotifyContext?: string
  attachedTo?: string
  attachedToClass?: string
  /** The platform's own type id — a mention, an assignment, a reply. */
  types?: string[]
}

/**
 * The platform stores a person's display name as `Last,First`, which is a sort
 * key rather than a name. One place turns it back into one.
 */
export const nameOf = (person: { name?: string } | undefined | null): string => {
  const raw = person?.name ?? ''
  if (!raw.includes(',')) return raw
  const [last, first] = raw.split(',')
  return [first, last].filter(Boolean).join(' ').trim()
}

/** `PROJ-42`, the id a person actually quotes. */
export const ref = (project: Pick<Project, 'identifier'> | undefined, issue: Pick<Issue, 'number'>) =>
  project ? `${project.identifier}-${issue.number}` : `#${issue.number}`

/**
 * A cache key. The CLASS comes first and nothing else may, because forgetting
 * a class by prefix is how another person's change reaches this screen: the
 * plane broadcasts a transaction, `<Space>` drops every key beginning with its
 * `objectClass`, and the reads under it run again. A key that buried the class
 * would need a table mapping classes to families, and that table is exactly the
 * thing that goes stale.
 */
export const key = (cls: string, ...parts: (string | number | undefined | null)[]) =>
  [cls, ...parts.map((p) => p ?? '')].join('|')
