import { useState } from "react";
import { Alert, Avatar, Button, Card, Empty, Flex, Form, Input, InputNumber, Popconfirm, Popover, Skeleton, Tag, Typography, message, theme } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
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
    <Empty description="Todavía no pertenecés a ningún household">
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
      onOpenChange={setOpen}
      trigger="click"
      title="Cambiar nivel"
      content={
        <Flex gap={8}>
          <InputNumber min={callerLevel + 1} precision={0} value={level} onChange={setLevel} />
          <Button type="primary" loading={changeMutation.isPending} onClick={handleSave}>
            Guardar
          </Button>
        </Flex>
      }
    >
      <Button size="small" icon={<EditOutlined />} aria-label={`Cambiar nivel de ${memberName(member)}`} />
    </Popover>
  );
}

function MemberCard({ member, callerLevel }: { member: HouseholdMember; callerLevel: number }) {
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
      style={{ width: 240, borderColor: member.self ? token.colorPrimary : undefined }}
      styles={{ body: { padding: 12 } }}
    >
      <Flex vertical align="center" gap={4}>
        <Avatar style={{ background: token.colorPrimary }}>{memberName(member).slice(0, 2).toUpperCase()}</Avatar>
        <Text strong ellipsis style={{ maxWidth: "100%" }}>{memberName(member)}</Text>
        <Text type="secondary" ellipsis style={{ maxWidth: "100%", fontSize: 12 }}>{member.email}</Text>
        <Flex gap={4} wrap justify="center">
          <Tag>Nivel {member.level}</Tag>
          {member.self && <Tag color="blue">Vos</Tag>}
          {member.supervised && <Tag color="gold" icon={<EyeOutlined />}>Supervisado</Tag>}
        </Flex>
        {member.canManage && (
          <Flex gap={4}>
            <ChangeLevel member={member} callerLevel={callerLevel} />
            <Popconfirm
              title={`Sacar a ${memberName(member)} del household`}
              okText="Sacar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true, loading: removeMutation.isPending }}
              onConfirm={handleRemove}
            >
              <Button size="small" danger icon={<DeleteOutlined />} aria-label={`Sacar a ${memberName(member)}`} />
            </Popconfirm>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

function Tree({ household }: { household: Household }) {
  const { token } = theme.useToken();
  const callerLevel = household.members.find((m) => m.self)?.level ?? 0;
  const levels = [...new Set(household.members.map((m) => m.level))].sort((a, b) => a - b);

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" wrap gap={8}>
        <Title level={3} style={{ margin: 0 }}>{household.name}</Title>
        {household.canManage && <AddHouseholdMemberModal callerLevel={callerLevel} />}
      </Flex>
      <Flex vertical align="center">
        {levels.map((level, i) => (
          <Flex key={level} vertical align="center" gap={8}>
            {/* Conecta tiers, no personas: el modelo no tiene aristas padre-hijo. */}
            {i > 0 && <div style={{ width: 2, height: 24, background: token.colorBorder }} />}
            <Text type="secondary">Nivel {level}</Text>
            <Flex gap={16} wrap justify="center">
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
  const { data, error, isLoading } = useHousehold();
  return (
    <Flex vertical style={{ padding: 24 }}>
      {isLoading ? (
        <Skeleton active />
      ) : data ? (
        <Tree household={data} />
      ) : isHouseholdNotFound(error) ? (
        <CreateHousehold />
      ) : (
        <Alert type="error" showIcon message="No se pudo cargar el household" />
      )}
    </Flex>
  );
}
