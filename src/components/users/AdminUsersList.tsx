import { useMemo, useState } from "react";
import { Alert, Card, Empty, Flex, Grid, Input, Skeleton, Table, Tag, Typography, theme } from "antd";
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
  WorkspaceRole,
} from "@/models/AdminUser";

const { Text, Title } = Typography;

const USER_TYPE_COLOR: Record<string, string> = {
  PERSONAL: "blue",
  ENTERPRISE: "green",
};

const USER_ROLE_LABEL: Record<UserRole, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_FAMILY: "Family",
  ROLE_GUEST: "Guest",
};

const USER_ROLE_COLOR: Record<UserRole, string> = {
  ROLE_ADMIN: "gold",
  ROLE_FAMILY: "purple",
  ROLE_GUEST: "default",
};

const WORKSPACE_ROLE_LABEL: Record<WorkspaceRole, string> = {
  OWNER: "Owner",
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

function displayName(user: AdminUserSummary): string {
  return [user.givenName, user.familyName].filter(Boolean).join(" ") || user.email;
}

function visibleWorkspaces(user: AdminUserSummary): AdminUserWorkspaceMembership[] {
  return user.workspaces.filter((w) => isVisibleWorkspaceName(w.workspaceName));
}

function matchesSearch(user: AdminUserSummary, query: string): boolean {
  const haystack = `${displayName(user)} ${user.email}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function UserTypeTag({ user }: { user: AdminUserSummary }) {
  return <Tag color={USER_TYPE_COLOR[user.userType] ?? "default"}>{user.userType}</Tag>;
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
              <Text>{o.api}</Text>
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
  const { data: users, isLoading, isError } = useAdminUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    return users.filter((user) => matchesSearch(user, search));
  }, [users, search]);

  const columns: ColumnsType<AdminUserSummary> = [
    { title: "Usuario", key: "user", render: (_, user) => <UserCell user={user} /> },
    { title: "Tipo", key: "type", width: 110, responsive: ["md"], render: (_, user) => <UserTypeTag user={user} /> },
    { title: "Rol", key: "roles", width: 170, responsive: ["md"], render: (_, user) => <UserRoleTags user={user} /> },
    {
      title: "Creado",
      key: "createdAt",
      width: 110,
      responsive: ["md"],
      render: (_, user) => <Text type="secondary">{formatDate(user.createdAt)}</Text>,
    },
    {
      title: "Workspaces",
      key: "workspaces",
      width: 140,
      responsive: ["md"],
      align: "right",
      render: (_, user) => {
        const count = visibleWorkspaces(user).length;
        return (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {count === 0 ? "Sin workspaces" : `${count} workspace${count > 1 ? "s" : ""}`}
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
          placeholder="Buscar por nombre o email..."
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        {isError && (
          <Alert
            type="error"
            showIcon
            title="No se pudo cargar el listado de usuarios"
            description="Probá recargar la página. Si el problema persiste, puede ser que api-identity no esté disponible."
          />
        )}

        {isLoading && <Skeleton active paragraph={{ rows: 4 }} />}

        {!isLoading && !isError && filteredUsers.length === 0 && (
          <Empty description={search ? "Ningún usuario coincide con la búsqueda" : "No hay usuarios todavía"} />
        )}

        {!isLoading && !isError && filteredUsers.length > 0 && (
          <Table<AdminUserSummary>
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            pagination={false}
            tableLayout="fixed"
            sticky={{ offsetHeader: 56 }}
            expandable={{ expandedRowRender: (user) => <UserDetails user={user} compact={!screens.md} /> }}
          />
        )}
      </Card>
    </Flex>
  );
}
