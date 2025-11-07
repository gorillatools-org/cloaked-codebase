import DataDeleteService from "@/api/actions/data-delete-service";
import { computed, onBeforeUnmount, ref } from "vue";

const POLL_COUNT_LIMIT = 15;

export const useScanProgress = () => {
  const scan = ref(null);
  const hasError = ref(false);
  const pollCount = ref(0);
  const orderCount = ref(0);

  let canFetch = true;
  let interval = null;

  onBeforeUnmount(() => {
    clearInterval(interval);
  });

  const withFixedOrderAndStatus = (brokers) =>
    brokers
      .reduce(
        (result, broker) => [
          ...result,
          {
            ...broker,
            order:
              scan.value?.brokers.find(
                (existingBroker) => existingBroker.id === broker.id
              )?.order ?? orderCount.value++,
            status:
              scan.value?.brokers.find(
                (existingBroker) => existingBroker.id === broker.id
              )?.status ?? "scanning",
          },
        ],
        scan.value?.brokers?.filter((existingBroker) =>
          brokers.every((newBroker) => existingBroker.id !== newBroker.id)
        ) ?? []
      )
      .sort((a, b) => a.order - b.order);

  const initiate = async (person) => {
    scan.value = null;
    hasError.value = false;
    pollCount.value = 0;
    orderCount.value = 0;
    canFetch = true;

    try {
      const newScan = (await DataDeleteService.createScan(person)).data;
      newScan.brokers = withFixedOrderAndStatus(newScan.brokers);
      scan.value = newScan;
    } catch {
      // error here is a design feature of the API (scan already exists)
      await getScanUpdate();
    }

    interval = setInterval(getScanUpdate, 1000);
  };

  const getScanUpdate = async () => {
    try {
      // artificial scanning progress
      if (pollCount.value % 2 === 0 && scan.value?.brokers) {
        scan.value.brokers =
          scan.value?.brokers?.map((broker) => ({
            ...broker,
            status:
              broker.order < pollCount.value - Math.floor(Math.random() * 3) + 1
                ? "done"
                : broker.status,
          })) ?? [];
      }

      if (!canFetch) {
        pollCount.value++;
        return;
      }

      canFetch = false;
      if (scan.value?.array_status !== "done") {
        const newScan = (await DataDeleteService.getScanProgress()).data;
        newScan.brokers = withFixedOrderAndStatus(newScan.brokers);
        scan.value = newScan;
      }

      if (isFinished.value || pollCount.value > POLL_COUNT_LIMIT) {
        clearInterval(interval);
      }

      pollCount.value++;
      canFetch = true;
    } catch (error) {
      console.error(error);
      clearInterval(interval);
      hasError.value = true;
    }
  };

  const isFinished = computed(() => {
    return (
      pollCount.value > POLL_COUNT_LIMIT ||
      hasError.value ||
      (scannedBrokersDisplayed.value.length > 4 &&
        scannedBrokersDisplayed.value.every(
          (broker) => broker.status === "done"
        ))
    );
  });

  const scannedBrokers = computed(
    () =>
      scan.value?.brokers?.map((broker) => ({
        id: broker.id,
        name: broker.broker_name,
        hasRecords: !!broker.records_matched,
        order: broker.order,
        status: broker.status,
      })) ?? []
  );

  const submittedBrokers = computed(() =>
    scannedBrokers.value?.filter((broker) => broker.hasRecords)
  );

  const scannedBrokersDisplayed = computed(() => {
    return scannedBrokers.value?.slice(0, 5) ?? [];
  });

  const submittedBrokersDisplayed = computed(() =>
    (submittedBrokers.value?.filter((broker) => broker.hasRecords) ?? []).slice(
      0,
      5
    )
  );

  return {
    initiate,
    scannedBrokers,
    submittedBrokers,
    scannedBrokersDisplayed,
    submittedBrokersDisplayed,
    isFinished,
  };
};
