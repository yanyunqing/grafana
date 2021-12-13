import React, { useEffect, useMemo, useState } from 'react';
import { UserPicker } from 'app/core/components/Select/UserPicker';
import { TeamPicker } from 'app/core/components/Select/TeamPicker';
import { Button, Form, HorizontalGroup, Select } from '@grafana/ui';
import { OrgRole } from 'app/types/acl';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { Assignments, PermissionTarget, SetPermission } from './types';

const roles = [OrgRole.Admin, OrgRole.Editor, OrgRole.Viewer];

export interface Props {
  permissions: string[];
  assignments: Assignments;
  canListUsers: boolean;
  onCancel: () => void;
  onAdd: (state: SetPermission) => void;
}

export const AddPermission = ({ permissions, assignments, canListUsers, onAdd, onCancel }: Props) => {
  const [target, setPermissionTarget] = useState<PermissionTarget>(PermissionTarget.User);
  const [teamId, setTeamId] = useState<number>(0);
  const [userId, setUserId] = useState<number>(0);
  const [builtInRole, setBuiltinRole] = useState<string>('');
  const [permission, setPermission] = useState<string>('');

  const targetOptions = useMemo(() => {
    const options = [] as any;
    if (assignments.users && canListUsers) {
      options.push({ value: PermissionTarget.User, label: 'User', isDisabled: false });
    }
    if (assignments.teams) {
      options.push({ value: PermissionTarget.Team, label: 'Team' });
    }
    if (assignments.builtInRoles) {
      options.push({ value: PermissionTarget.BuiltInRole, label: 'Role' });
    }
    return options;
  }, [assignments, canListUsers]);

  useEffect(() => {
    if (permissions.length > 0) {
      setPermission(permissions[0]);
    }
  }, [permissions]);

  const isValid = () => {
    switch (target) {
      case PermissionTarget.Team:
        return teamId > 0;
      case PermissionTarget.User:
        return userId > 0;
      case PermissionTarget.BuiltInRole:
        return roles.some((r) => r === builtInRole);
    }
    return false;
  };

  return (
    <div className="cta-form" aria-label="Permissions slider">
      <CloseButton onClick={onCancel} />
      <h5>Add Permission For</h5>
      <Form
        name="addPermission"
        maxWidth="none"
        onSubmit={() => onAdd({ userId, teamId, builtInRole, permission, target })}
      >
        {() => (
          <HorizontalGroup>
            <Select
              aria-label="Role to add new permission to"
              value={target}
              options={targetOptions}
              onChange={(v) => setPermissionTarget(v.value as PermissionTarget)}
              menuShouldPortal
            />

            {target === PermissionTarget.User && (
              <UserPicker onSelected={(u) => setUserId(u.value || 0)} className={'width-20'} />
            )}

            {target === PermissionTarget.Team && (
              <TeamPicker onSelected={(t) => setTeamId(t.value?.id || 0)} className={'width-20'} />
            )}

            {target === PermissionTarget.BuiltInRole && (
              <Select
                aria-label={'Built-in role picker'}
                menuShouldPortal
                options={roles.map((r) => ({ value: r, label: r }))}
                onChange={(r) => setBuiltinRole(r.value || '')}
                width={40}
              />
            )}

            <Select
              width={25}
              menuShouldPortal
              value={permissions.find((p) => p === permission)}
              options={permissions.map((p) => ({ label: p, value: p }))}
              onChange={(v) => setPermission(v.value || '')}
            />
            <Button type="submit" disabled={!isValid()}>
              Save
            </Button>
          </HorizontalGroup>
        )}
      </Form>
    </div>
  );
};