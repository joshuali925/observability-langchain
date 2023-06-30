/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CriteriaWithPagination,
  Direction,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiFlyoutBody,
  EuiLink,
  EuiPage,
  EuiPageBody,
  EuiText,
} from '@elastic/eui';
import React, { useMemo, useState } from 'react';
import { SavedObjectsFindOptions } from '../../../../../../../src/core/public';
import { SavedObjectsFindResult } from '../../../../../../../src/core/server';
import { IChat } from '../../../../../common/types/observability_saved_object_attributes';
import { useChatActions } from '../../hooks/use_chat_actions';
import { useBulkGetChat } from '../../hooks/use_get_chat';

interface ChatHistoryPageProps {
  className?: string;
}

type ItemType = SavedObjectsFindResult<IChat>;

export const ChatHistoryPage: React.FC<ChatHistoryPageProps> = (props) => {
  const { openChat } = useChatActions();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<Direction>('desc');
  const [sortField, setSortField] = useState<keyof ItemType>('updated_at');
  const bulkGetOptions: Partial<SavedObjectsFindOptions> = useMemo(
    () => ({
      page: pageIndex + 1,
      perPage: pageSize,
      sortOrder,
      sortField,
    }),
    [pageIndex, pageSize, sortOrder, sortField]
  );
  const { data: chats, loading, error } = useBulkGetChat(bulkGetOptions);

  const onTableChange = (criteria: CriteriaWithPagination<ItemType>) => {
    const { index, size } = criteria.page;
    setPageIndex(index);
    setPageSize(size);
    if (criteria.sort) {
      const { field, direction } = criteria.sort;
      setSortField(field);
      setSortOrder(direction);
    }
  };

  const columns: Array<EuiBasicTableColumn<ItemType>> = [
    {
      field: 'id',
      name: 'Chat',
      render: (id: string, item) => (
        <EuiLink onClick={() => openChat(id)}>{item.attributes.title}</EuiLink>
      ),
    },
    {
      field: 'updated_at',
      name: 'Updated Time',
      sortable: true,
      render: (updatedAt: string) => <EuiText size="s">{updatedAt}</EuiText>,
    },
  ];

  return (
    <EuiFlyoutBody className={props.className}>
      <EuiPage>
        <EuiPageBody component="div">
          <EuiBasicTable
            items={chats?.saved_objects || []}
            rowHeader="firstName"
            loading={loading}
            error={error?.message}
            columns={columns}
            pagination={{
              pageIndex,
              pageSize,
              totalItemCount: chats?.total || 0,
            }}
            onChange={onTableChange}
            sorting={{ sort: { field: sortField, direction: sortOrder } }}
          />
        </EuiPageBody>
      </EuiPage>
    </EuiFlyoutBody>
  );
};
