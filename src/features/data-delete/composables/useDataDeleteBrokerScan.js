import DataDeleteService from "@/api/actions/data-delete-service";
import { computed, ref } from "vue";

export const useDataDeleteBrokerScan = () => {
  const scan = ref(null);
  const hasScanError = ref(false);

  const initiateScan = async (person) => {
    if (scan.value) {
      return;
    }

    let scanInterval = null;

    try {
      scan.value = (await DataDeleteService.createScan(person)).data;
    } catch {
      try {
        scan.value = (await DataDeleteService.getScanProgress()).data;
      } catch {
        hasScanError.value = true;
      }
    }

    const getScanUpdate = async () => {
      try {
        scan.value = (await DataDeleteService.getScanProgress()).data;

        if (progress.value.isScanFinished) {
          clearInterval(scanInterval);
        }
      } catch {
        clearInterval(scanInterval);
        hasScanError.value = true;
      }
    };

    scanInterval = setInterval(getScanUpdate, 1000);
    getScanUpdate();
  };

  const records = computed(() =>
    scan.value?.brokers.reduce((result, broker) => {
      return [
        ...result,
        ...(broker.records ?? []).map((record) => ({
          id: record.id,
          brokerName: broker.broker_name,
          infoTypes: broker.broker_info_types,
          ...JSON.parse(record.pii),
        })),
      ];
    }, [])
  );

  const progress = computed(() => ({
    isScanStarted: !!scan.value?.array_started_at,
    isScanFinished: scan.value?.array_status === "done",
    currentBroker: scan.value?.brokers[0],
    exposuresCount: scan.value?.exposures_count,
    brokerCountTotal: scan.value?.broker_count,
    brokerCountScanned: scan.value?.brokers.length,
    brokerCountWithRecords: scan.value?.brokers.filter(
      (broker) => broker?.records?.length
    ).length,
  }));

  const sortedRecords = computed(() =>
    records.value
      ? [...records.value].sort(
          (a, b) => JSON.stringify(b).length - JSON.stringify(a).length
        )
      : null
  );

  return {
    initiateScan,
    hasScanError,
    progress,
    records,
    sortedRecords,
  };
};
