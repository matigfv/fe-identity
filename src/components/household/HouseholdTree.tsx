import { useState } from "react";
import { Alert, Avatar, Button, Card, Empty, Flex, Form, Input, InputNumber, Popconfirm, Popover, Skeleton, Tag, Tooltip, Typography, message, theme } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import LockOutlined from "@ant-design/icons/LockOutlined";
import { useHousehold, isHouseholdNotFound } from "@/apis/hooks/useHousehold";
import {
  useChangeHouseholdMemberLevel,
  useCreateHousehold,
  useRemoveHouseholdMember,
} from "@/apis/hooks/useHouseholdMutations";
import AddHouseholdMemberModal from "@/components/household/AddHouseholdMemberModal";
import type { Household, HouseholdMember } from "@/models/Household";

const { Text, Title } = Typography;

function memberName(member: HouseholdMember): string {
  if (member.givenName) {
    return member.familyName ? `${member.givenName} ${member.familyName}` : member.givenName;
  }
  return member.email;
}

// Los errores de mutación se leen igual que en el resto del proyecto (status de Axios).
function errorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status;
}

function CreateHousehold() {
  const createMutation = useCreateHousehold();
  const handleSubmit = ({ name }: { name: string }) =>
    createMutation.mutate(name, {
      onSuccess: () => message.success("Household creado"),
      onError: (error) =>
        message.error(errorStatus(error) === 409 ? "Ya pertenecés a un household" : "Error al crear el household"),
    });
  return (
    <Empty
      description={
        <Flex vertical gap={4}>
          <Text>Todavía no pertenecés a ningún household</Text>
          <Text type="secondary">
            Un household agrupa personas por niveles: el nivel 1 tiene más permisos y podés sumar gente en niveles más bajos.
          </Text>
        </Flex>
      }
    >
      <Form layout="inline" onFinish={handleSubmit} style={{ justifyContent: "center" }}>
        <Form.Item name="name" rules={[{ required: true, message: "Ingresá un nombre" }]}>
          <Input placeholder="Nombre del household" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
          Crear household
        </Button>
      </Form>
    </Empty>
  );
}

const MAX_LEVEL = 99;

function ChangeLevel({ member, callerLevel }: { member: HouseholdMember; callerLevel: number }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<number | null>(member.level);
  const changeMutation = useChangeHouseholdMemberLevel();
  const handleSave = () => {
    if (level === null) return;
    changeMutation.mutate(
      { userId: member.userId, level },
      {
        onSuccess: () => {
          message.success(`${memberName(member)} ahora es nivel ${level}`);
          setOpen(false);
        },
        onError: (error) =>
          message.error(errorStatus(error) === 403 ? "No tenés permiso para asignar ese nivel" : "Error al cambiar el nivel"),
      },
    );
  };
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setLevel(member.level);
        setOpen(next);
      }}
      trigger="click"
      title="Cambiar nivel"
      content={
        <Flex gap={8}>
          <InputNumber min={callerLevel + 1} max={MAX_LEVEL} precision={0} value={level} onChange={setLevel} aria-label="Nivel" />
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="primary" loading={changeMutation.isPending} onClick={handleSave}>
            Guardar
          </Button>
        </Flex>
      }
    >
      <Tooltip title="Cambiar nivel">
        <Button icon={<EditOutlined />} aria-label={`Cambiar nivel de ${memberName(member)}`} />
      </Tooltip>
    </Popover>
  );
}

// Only claims what the model knows: a level comparison, otherwise a neutral message.
function lockReason(member: HouseholdMember, callerLevel?: number): string {
  if (callerLevel !== undefined && member.level <= callerLevel) {
    return "Tiene tu mismo nivel o uno superior, por eso no podés gestionarlo";
  }
  return "No tenés permiso para gestionar a este miembro";
}

function MemberCard({ member, callerLevel }: { member: HouseholdMember; callerLevel?: number }) {
  const { token } = theme.useToken();
  const removeMutation = useRemoveHouseholdMember();
  const handleRemove = () =>
    removeMutation.mutate(member.userId, {
      onSuccess: () => message.success(`${memberName(member)} fue eliminado del household`),
      onError: (error) =>
        message.error(errorStatus(error) === 403 ? "No tenés permiso para eliminar a este miembro" : "Error al eliminar al miembro"),
    });
  return (
    <Card
      size="small"
      style={{ width: "min(100%, 240px)", borderColor: member.self ? token.colorPrimary : undefined }}
      styles={{ body: { padding: 12 } }}
    >
      <Flex vertical align="center" gap={4}>
        <Avatar style={{ background: token.colorPrimary }}>{memberName(member).slice(0, 2).toUpperCase()}</Avatar>
        <Text strong ellipsis={{ tooltip: memberName(member) }} style={{ maxWidth: "100%" }}>{memberName(member)}</Text>
        <Text type="secondary" ellipsis={{ tooltip: member.email }} style={{ maxWidth: "100%", fontSize: 12 }}>{member.email}</Text>
        <Flex gap={4} wrap justify="center">
          {member.self && <Tag color="blue">Vos</Tag>}
          {member.supervised && <Tag color="gold" icon={<EyeOutlined />}>Supervisado</Tag>}
        </Flex>
        {!member.canManage && !member.self && (
          <Tooltip title={lockReason(member, callerLevel)}>
            <span tabIndex={0} role="img" aria-label={lockReason(member, callerLevel)} style={{ color: token.colorTextSecondary }}>
              <LockOutlined />
            </span>
          </Tooltip>
        )}
        {member.canManage && callerLevel === undefined && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Acciones no disponibles: no pudimos determinar tu nivel.
          </Text>
        )}
        {member.canManage && callerLevel !== undefined && (
          <Flex gap={8}>
            <ChangeLevel member={member} callerLevel={callerLevel} />
            <Popconfirm
              title={`Sacar a ${memberName(member)} del household`}
              description="Va a perder el acceso a este household."
              okText="Sacar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true, loading: removeMutation.isPending }}
              onConfirm={handleRemove}
            >
              <Tooltip title="Sacar del household">
                <Button danger icon={<DeleteOutlined />} aria-label={`Sacar a ${memberName(member)}`} />
              </Tooltip>
            </Popconfirm>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

// Honest for every tier: only the extremes of the visible range are compared.
function tierCaption(level: number, index: number, count: number): string {
  if (count > 1 && index === 0) return `Nivel ${level} · más poder`;
  if (count > 1 && index === count - 1) return `Nivel ${level} · menos poder`;
  return `Nivel ${level}`;
}

function Tree({ household }: { household: Household }) {
  const { token } = theme.useToken();
  // Without the caller's own member the level is unknown: never assume 0 (it would allow level 1).
  const callerLevel = household.members.find((m) => m.self)?.level;
  const canAdd = household.canManage && callerLevel !== undefined;
  const levels = [...new Set(household.members.map((m) => m.level))].sort((a, b) => a - b);

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Title level={3} style={{ margin: 0 }}>{household.name}</Title>
        {canAdd && <AddHouseholdMemberModal callerLevel={callerLevel} />}
      </Flex>
      <Text type="secondary">Nivel 1 = más permisos. Un número mayor tiene menos poder.</Text>
      {canAdd && household.members.length === 1 && (
        <Alert type="info" showIcon message="Sos el único miembro por ahora. Agregá a la primera persona con «Agregar miembro»." />
      )}
      <Flex vertical align="center" style={{ width: "100%" }}>
        {levels.map((level, i) => (
          <Flex key={level} vertical align="center" gap={8} style={{ width: "100%" }}>
            {/* Conecta tiers, no personas: el modelo no tiene aristas padre-hijo. */}
            {i > 0 && <div style={{ width: 2, height: 28, background: token.colorTextQuaternary }} />}
            <Text
              type="secondary"
              style={{ background: token.colorFillTertiary, borderRadius: token.borderRadiusSM, padding: "2px 12px" }}
            >
              {tierCaption(level, i, levels.length)}
            </Text>
            <Flex gap={16} wrap justify="center" style={{ width: "100%" }}>
              {household.members.filter((m) => m.level === level).map((m) => (
                <MemberCard key={m.userId} member={m} callerLevel={callerLevel} />
              ))}
            </Flex>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
}

export default function HouseholdTree() {
  const { data, error, isLoading, refetch } = useHousehold();
  return (
    <Flex vertical style={{ padding: 24, minWidth: 0 }}>
      {isLoading ? (
        <Skeleton active />
      ) : data ? (
        <Tree household={data} />
      ) : isHouseholdNotFound(error) ? (
        <CreateHousehold />
      ) : (
        <Alert
          type="error"
          showIcon
          message="No se pudo cargar el household"
          action={<Button size="small" onClick={() => refetch()}>Reintentar</Button>}
        />
      )}
    </Flex>
  );
}
