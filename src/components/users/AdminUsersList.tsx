import { useMemo, useState } from "react";
import { Alert, Button, Card, Checkbox, ConfigProvider, Empty, Flex, Grid, Input, Select, Skeleton, Table, Tag, Typography, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import { useAdminUsers } from "@/apis/hooks/useAdminUsers";
import { isVisibleWorkspaceName } from "@/utils/workspaceVisibility";
import type {
  AdminUserSummary,
  AdminUserWorkspaceMembership,
  UserRole,
  UserType,
  WorkspaceRole,
} from "@/models/AdminUser";

const { Text, Title } = Typography;

const USER_TYPE_COLOR: Record<string, string> = {
  PERSONAL: "blue",
  ENTERPRISE: "green",
};

const USER_TYPE_LABEL: Record<UserType, string> = {
  PERSONAL: "Personal",
  ENTERPRISE: "Empresa",
};

const USER_ROLE_LABEL: Record<UserRole, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_FAMILY: "Familia",
  ROLE_GUEST: "Invitado",
};

const USER_ROLE_COLOR: Record<UserRole, string> = {
  ROLE_ADMIN: "gold",
  ROLE_FAMILY: "purple",
  ROLE_GUEST: "default",
};

const WORKSPACE_ROLE_LABEL: Record<WorkspaceRole, string> = {
  OWNER: "Propietario",
  COLLABORATOR: "Colaborador",
  READ_ONLY: "Solo lectura",
};

const WORKSPACE_ROLE_COLOR: Record<WorkspaceRole, string> = {
  OWNER: "gold",
  COLLABORATOR: "blue",
  READ_ONLY: "default",
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

// "api-movements" -> "Movements"
function humanizeApi(api: string): string {
  const name = api.replace(/^api-/, "").replace(/[-_]+/g, " ").trim();
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : api;
}

function displayName(user: AdminUserSummary): string {
  return [user.givenName, user.familyName].filter(Boolean).join(" ") || user.email;
}

function visibleWorkspaces(user: AdminUserSummary): AdminUserWorkspaceMembership[] {
  return user.workspaces.filter((w) => isVisibleWorkspaceName(w.workspaceName));
}

// Accent- and case-insensitive: "jose" finds "José".
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function matchesSearch(user: AdminUserSummary, query: string): boolean {
  const haystack = normalize(`${user.givenName ?? ""} ${user.familyName ?? ""} ${user.email}`);
  return haystack.includes(normalize(query.trim()));
}

const PAGE_SIZE = 25;

function UserTypeTag({ user }: { user: AdminUserSummary }) {
  return <Tag color={USER_TYPE_COLOR[user.userType] ?? "default"}>{USER_TYPE_LABEL[user.userType] ?? user.userType}</Tag>;
}

function UserRoleTags({ user }: { user: AdminUserSummary }) {
  if (user.userRoles.length === 0) return <Text type="secondary">—</Text>;
  return (
    <Flex gap={4} wrap>
      {user.userRoles.map((role) => (
        <Tag key={role} color={USER_ROLE_COLOR[role] ?? "default"} style={{ marginInlineEnd: 0 }}>
          {USER_ROLE_LABEL[role] ?? role}
        </Tag>
      ))}
    </Flex>
  );
}

function UserCell({ user }: { user: AdminUserSummary }) {
  const name = displayName(user);
  return (
    <Flex vertical style={{ minWidth: 0 }}>
      <Text strong ellipsis={{ tooltip: name }}>
        {name}
      </Text>
      {name !== user.email && (
        <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: user.email }}>
          {user.email}
        </Text>
      )}
    </Flex>
  );
}

function UserDetails({ user, compact }: { user: AdminUserSummary; compact: boolean }) {
  const { token } = theme.useToken();
  const workspaces = visibleWorkspaces(user);

  return (
    <div style={{ padding: "12px 16px 16px", background: token.colorFillAlter }}>
      {compact && (
        <Flex gap={8} wrap align="center" style={{ marginBottom: 16 }}>
          <UserTypeTag user={user} />
          <UserRoleTags user={user} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Creado {formatDate(user.createdAt)}
          </Text>
        </Flex>
      )}
      <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
        Workspaces
      </Text>
      <Flex vertical style={{ marginTop: 8, marginBottom: 16 }}>
        {workspaces.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            No pertenece a ningún workspace
          </Text>
        ) : (
          workspaces.map((w, idx) => (
            <Flex
              key={w.workspaceId}
              align="center"
              justify="space-between"
              style={{
                padding: "8px 4px",
                borderTop: idx > 0 ? `1px solid ${token.colorBorderSecondary}` : undefined,
              }}
            >
              <Text>{w.workspaceName}</Text>
              <Flex align="center" gap={12}>
                <Tag color={WORKSPACE_ROLE_COLOR[w.role]}>{WORKSPACE_ROLE_LABEL[w.role] ?? w.role}</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Desde {formatDate(w.joinedAt)}
                </Text>
              </Flex>
            </Flex>
          ))
        )}
      </Flex>

      <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
        Onboarding
      </Text>
      <Text type="secondary" style={{ display: "block", fontSize: 13, marginTop: 4 }}>
        Tour completo: ya recorrió la guía inicial de la app. Tour pendiente: todavía no la vio.
      </Text>
      <Flex vertical style={{ marginTop: 8 }}>
        {user.onboarding.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Todavía no hizo onboarding en ninguna app
          </Text>
        ) : (
          user.onboarding.map((o, idx) => (
            <Flex
              key={o.api}
              align="center"
              justify="space-between"
              style={{
                padding: "8px 4px",
                borderTop: idx > 0 ? `1px solid ${token.colorBorderSecondary}` : undefined,
              }}
            >
              <Text>{humanizeApi(o.api)}</Text>
              {o.hasSeenTour ? (
                <Tag color="success" icon={<CheckCircleFilled />}>
                  Tour completo
                </Tag>
              ) : (
                <Tag color="default" icon={<CloseCircleOutlined />}>
                  Tour pendiente
                </Tag>
              )}
            </Flex>
          ))
        )}
      </Flex>
    </div>
  );
}

export default function AdminUsersList() {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const { data: users, isLoading, isError, refetch, isFetching } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [noWorkspace, setNoWorkspace] = useState(false);
  const [pendingTour, setPendingTour] = useState(false);
  const [page, setPage] = useState(1);

  const hasFilters = types.length > 0 || roles.length > 0 || noWorkspace || pendingTour;
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        (!search.trim() || matchesSearch(user, search)) &&
        (types.length === 0 || types.includes(user.userType)) &&
        (roles.length === 0 || user.userRoles.some((r) => roles.includes(r))) &&
        (!noWorkspace || visibleWorkspaces(user).length === 0) &&
        (!pendingTour || user.onboarding.some((o) => !o.hasSeenTour)),
    );
  }, [users, search, types, roles, noWorkspace, pendingTour]);

  // Any change to the result set sends the user back to the first page.
  const resetPage =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  const clearAll = () => {
    setPage(1);
    setSearch("");
    setTypes([]);
    setRoles([]);
    setNoWorkspace(false);
    setPendingTour(false);
  };

  const columns: ColumnsType<AdminUserSummary> = [
    {
      title: "Usuario",
      key: "user",
      sorter: (a, b) => displayName(a).localeCompare(displayName(b), "es", { sensitivity: "base" }),
      render: (_, user) => <UserCell user={user} /> },
    { title: "Tipo", key: "type", width: 110, responsive: ["md"], render: (_, user) => <UserTypeTag user={user} /> },
    { title: "Rol", key: "roles", width: 170, responsive: ["md"], render: (_, user) => <UserRoleTags user={user} /> },
    {
      title: "Creado",
      key: "createdAt",
      width: 120,
      sorter: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || 0,
      responsive: ["md"],
      render: (_, user) => <Text type="secondary">{formatDate(user.createdAt)}</Text>,
    },
    {
      title: "Workspaces",
      key: "workspaces",
      width: 220,
      responsive: ["md"],
      render: (_, user) => {
        const names = visibleWorkspaces(user).map((w) => w.workspaceName);
        if (names.length === 0) return <Text type="secondary">Sin workspaces</Text>;
        const all = names.join(", ");
        const extra = names.length - 2;
        return (
          <Text ellipsis={{ tooltip: all }} style={{ fontSize: 13 }}>
            {names.slice(0, 2).join(", ")}
            {extra > 0 && <Text type="secondary">{` +${extra}`}</Text>}
          </Text>
        );
      },
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex align="center" gap={10} style={{ marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: token.borderRadius,
              background: token.colorPrimaryBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TeamOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
          </div>
          <div>
            <Title level={1} style={{ fontSize: 16, margin: 0, lineHeight: 1.5 }}>
              Usuarios
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Todos los usuarios de la instancia y a qué workspaces pertenecen
            </Text>
          </div>
        </Flex>

        <Input
          allowClear
          aria-label="Buscar usuarios por nombre o email"
          placeholder="Buscar por nombre, apellido o email"
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          value={search}
          onChange={(e) => resetPage(setSearch)(e.target.value)}
        />

        <Flex gap={8} wrap align="center" style={{ margin: "12px 0 16px" }}>
          <Select
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            placeholder="Tipo"
            aria-label="Filtrar por tipo"
            style={{ minWidth: 140 }}
            value={types}
            onChange={resetPage(setTypes)}
            options={Object.entries(USER_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <Select
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            placeholder="Rol"
            aria-label="Filtrar por rol"
            style={{ minWidth: 140 }}
            value={roles}
            onChange={resetPage(setRoles)}
            options={Object.entries(USER_ROLE_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <Checkbox checked={noWorkspace} onChange={(e) => resetPage(setNoWorkspace)(e.target.checked)}>
            Sin workspace
          </Checkbox>
          <Checkbox checked={pendingTour} onChange={(e) => resetPage(setPendingTour)(e.target.checked)}>
            Onboarding pendiente
          </Checkbox>
          {users && !isLoading && (
            <Text type="secondary" style={{ fontSize: 13, marginInlineStart: "auto" }} aria-live="polite">
              {filteredUsers.length} de {users.length} usuarios
            </Text>
          )}
        </Flex>

        {isError && (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el listado de usuarios"
            description="Revisá tu conexión y volvé a intentar. Si el problema sigue, avisale al equipo."
            action={
              <Button size="small" loading={isFetching} onClick={() => void refetch()}>
                Reintentar
              </Button>
            }
          />
        )}

        {isLoading && <Skeleton active paragraph={{ rows: 4 }} />}

        {!isLoading && !isError && filteredUsers.length === 0 && (
          <Empty
            description={search || hasFilters ? "Ningún usuario coincide con la búsqueda" : "No hay usuarios todavía"}
          >
            {(search || hasFilters) && <Button onClick={clearAll}>{search ? "Limpiar búsqueda" : "Limpiar filtros"}</Button>}
          </Empty>
        )}

        {!isLoading && !isError && filteredUsers.length > 0 && (
          <ConfigProvider
            theme={{ components: { Table: { headerBg: token.colorFillAlter, headerColor: token.colorTextSecondary } } }}
          >
          <Table<AdminUserSummary>
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            pagination={{ current: page, onChange: setPage, pageSize: PAGE_SIZE, showSizeChanger: false, hideOnSinglePage: true }}
            tableLayout="fixed"
            sticky={{ offsetHeader: 56 }}
            expandable={{ expandedRowRender: (user) => <UserDetails user={user} compact={!screens.md} /> }}
          />
          </ConfigProvider>
        )}
      </Card>
    </Flex>
  );
}
